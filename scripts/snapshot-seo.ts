/**
 * Captures the SEO-relevant head tags of every prerendered page into a single JSON
 * snapshot. Diff two snapshots to prove a change did not alter page metadata.
 *
 *   bun run snapshot:seo dist/client before.json
 *   # ...make a change, rebuild...
 *   bun run snapshot:seo dist/client after.json
 *   diff before.json after.json
 */
import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

/** Head tags carrying no SEO meaning — bundler assets and framework markers. */
const isAssetTag = (tag: ParsedTag): boolean => {
    if (tag.name === 'script') {
        return !tag.attributes.type?.includes('ld+json');
    }

    if (tag.name === 'link') {
        const rel = tag.attributes.rel ?? '';

        return ['preload', 'prefetch', 'stylesheet', 'modulepreload', 'preconnect'].includes(rel);
    }

    return false;
};

type ParsedTag = {
    name: string;
    attributes: Record<string, string>;
    content: string | null;
};

const parseTag = (markup: string): ParsedTag | null => {
    const name = markup.match(/^<([a-zA-Z][a-zA-Z0-9]*)/)?.[1]?.toLowerCase();

    if (!name) {
        return null;
    }

    const attributes: Record<string, string> = {};

    for (const match of markup.matchAll(/([a-zA-Z][a-zA-Z0-9:_-]*)="([^"]*)"/g)) {
        attributes[match[1].toLowerCase()] = match[2];
    }

    const content = markup.match(/>([\s\S]*)<\//)?.[1] ?? null;

    return { name, attributes, content };
};

/**
 * Renders a tag as a stable, framework-neutral string. Cache-busting query strings on
 * icon hrefs are stripped so Next's hashed asset URLs compare equal to plain ones.
 */
const serializeTag = (tag: ParsedTag): string => {
    if (tag.name === 'title') {
        return `title: ${decodeHtmlEntities(tag.content ?? '')}`;
    }

    if (tag.name === 'script') {
        return `ld+json: ${normalizeJsonLd(tag.content ?? '')}`;
    }

    const attributes = Object.entries(tag.attributes)
        .map(([key, value]) => {
            const cleaned = key === 'href' ? value.replace(/\?.*$/, '') : value;

            return `${key}=${decodeHtmlEntities(cleaned)}`;
        })
        .sort();

    return `${tag.name}: ${attributes.join(' ')}`;
};

const decodeHtmlEntities = (value: string): string =>
    value
        .replace(/&quot;/g, '"')
        .replace(/&#x27;|&#39;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&');

/** Reformats JSON-LD so key order and whitespace differences don't register as changes. */
const normalizeJsonLd = (raw: string): string => {
    try {
        return JSON.stringify(sortKeysDeep(JSON.parse(decodeHtmlEntities(raw))));
    } catch {
        return raw.trim();
    }
};

const sortKeysDeep = (value: unknown): unknown => {
    if (Array.isArray(value)) {
        return value.map(sortKeysDeep);
    }

    if (value && typeof value === 'object') {
        return Object.fromEntries(
            Object.entries(value as Record<string, unknown>)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([key, nested]) => [key, sortKeysDeep(nested)])
        );
    }

    return value;
};

const extractSeoTags = (html: string): string[] => {
    const head = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i)?.[1] ?? '';
    const jsonLdBlocks = html.match(/<script[^>]*ld\+json[^>]*>[\s\S]*?<\/script>/gi) ?? [];
    const titleTags = head.match(/<title[^>]*>[\s\S]*?<\/title>/gi) ?? [];
    const voidTags = head.match(/<(meta|link)\b[^>]*>/gi) ?? [];

    return [...titleTags, ...voidTags, ...jsonLdBlocks]
        .map(parseTag)
        .filter((tag): tag is ParsedTag => tag !== null && !isAssetTag(tag))
        .map(serializeTag)
        .sort();
};

const collectHtmlFiles = async (directory: string): Promise<string[]> => {
    const entries = await readdir(directory, { withFileTypes: true, recursive: true });

    return entries
        .filter((entry) => entry.isFile() && entry.name.endsWith('.html'))
        .map((entry) => path.join(entry.parentPath, entry.name));
};

/** Turns an on-disk HTML path into the route it serves, in decoded form. */
const toRoute = (filePath: string, baseDirectory: string): string => {
    const relative = path
        .relative(baseDirectory, filePath)
        .replace(/\.html$/, '')
        .replace(/(^|\/)index$/, '');

    return decodeURIComponent(`/${relative}`.replace(/\/+$/, '') || '/');
};

const [htmlDirectory, outputFile] = process.argv.slice(2);

if (!htmlDirectory || !outputFile) {
    process.stderr.write('Usage: bun run scripts/snapshot-seo.ts <html-dir> <output-file>\n');
    process.exit(1);
}

const baseDirectory = path.resolve(htmlDirectory);
const files = await collectHtmlFiles(baseDirectory);
const snapshot: Record<string, string[]> = {};

for (const file of files) {
    snapshot[toRoute(file, baseDirectory)] = extractSeoTags(await readFile(file, 'utf8'));
}

const sorted = Object.fromEntries(
    Object.entries(snapshot).sort(([a], [b]) => a.localeCompare(b, 'en'))
);

await writeFile(path.resolve(outputFile), `${JSON.stringify(sorted, null, 2)}\n`);

process.stdout.write(
    `Captured ${Object.keys(sorted).length} routes from ${htmlDirectory} -> ${outputFile}\n`
);
