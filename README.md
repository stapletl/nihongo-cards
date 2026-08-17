# Nihongo Cards

[![Cloudflare Deploy](https://img.shields.io/website?url=https%3A%2F%2Fnihongo-cards.com&style=for-the-badge&logo=cloudflare&logoColor=white&label=Cloudflare&up_message=deployed&down_message=down)](https://nihongo-cards.com/) [![CI](https://img.shields.io/github/actions/workflow/status/stapletl/nihongo-cards/ci.yml?branch=main&style=for-the-badge&logo=githubactions&logoColor=white&label=CI)](https://github.com/stapletl/nihongo-cards/actions/workflows/ci.yml) [![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](./LICENSE)

[nihongo-cards.com](https://nihongo-cards.com/) A modern Japanese learning application for mastering Hiragana and Katakana through interactive flashcards and quizzes. The site is fully prerendered to static HTML, so it runs anywhere static files can be served.

## Features

- Reference pages for all Hiragana and Katakana characters — gojūon, dakuten/handakuten, and yōon
- Animated stroke-order diagrams (KanjiVG)
- Interactive flashcard study sessions
- Quizzes in both directions — kana to romanji and romanji to kana
- Native Japanese text-to-speech with selectable voices
- Progress tracking and statistics, stored locally in your browser — no account, no server
- Export, import, or delete your progress at any time
- Keyboard shortcuts throughout, plus a ⌘K command palette
- Light, dark, and color themes; responsive on phone and desktop

## Getting Started

1. Clone the repository
2. Install dependencies:

```bash
bun install
```

3. Run the development server:

```bash
bun run dev
```

Open [http://localhost:5173](http://localhost:5173) with your browser to start learning Japanese!

## Tech Stack

- [TanStack Start](https://tanstack.com/start) - Type-safe routing with static prerendering
- [Vite](https://vite.dev/) - Build tool
- [Tailwind CSS](https://tailwindcss.com/) - For styling
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Radix UI](https://www.radix-ui.com/) - Accessible component primitives
- [TypeScript](https://www.typescriptlang.org/) - Type safety

## Available Scripts

- `bun run dev` - Start the development server
- `bun run build` - Build and prerender the site to `dist/client`
- `bun run start` - Preview the production build
- `bun run typecheck` - Type-check with `tsc --noEmit`
- `bun run lint` - Run oxlint to check code quality
- `bun run lint --fix` - Have the linter fix all auto-fixable problems
- `bun run format` - Format all files using oxfmt
- `bun run format:check` - Check formatting without rewriting files
- `bun run test` - Run the Playwright end-to-end suite against a production build

## Deployment

The build writes static output to `dist/client` — there is no server component, no functions, and no runtime environment variables, so any static host can serve it. `404.html` is picked up automatically for unmatched paths.

Deploys run on Cloudflare's side via Workers Builds, which builds from the repo. Merging to `main` publishes to production; pushing to a PR branch uploads a preview version and comments the preview URL on the PR without touching production traffic. There is deliberately no CLI deploy path — `wrangler.jsonc` is config for Cloudflare's build, not something to invoke by hand.

## Contributing

The goal for this app is to have an extremely narrow scope and be virtually no work to maintain. If you have suggestions, comments, concerns, feel free to open an Issue. It is unlikely that large features will be added or large PRs will be reviewed.

## License

The source code is licensed under the [MIT License](LICENSE).

Stroke-order data in `public/kana-svgs/` is from [KanjiVG](http://kanjivg.tagaini.net) by Ulrich Apel and is licensed separately under [CC BY-SA 3.0](http://creativecommons.org/licenses/by-sa/3.0/). Those files, and any work derived from them, stay under CC BY-SA 3.0 — if you fork this project, they are not covered by the MIT grant.
