# Command Menu Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a cmdk-powered command palette with a ⌘K trigger and a visible search pill in the app header for keyboard-driven page navigation.

**Architecture:** Install `cmdk`, create a `CommandMenu` client component that owns open state and renders both a search-pill trigger button and a cmdk `Command` inside a Radix `Dialog`. Mount it in the existing header in `dashboard-layout.tsx`.

**Tech Stack:** cmdk, @tanstack/react-hotkeys (already installed), @radix-ui/react-dialog (already installed via components/ui/dialog.tsx), lucide-react, Next.js useRouter

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `package.json` | Modify | Add `cmdk` dependency |
| `components/command-menu.tsx` | Create | Command palette dialog + header trigger button |
| `components/layout/dashboard-layout.tsx` | Modify | Add `<CommandMenu />` to header |

---

### Task 1: Install cmdk

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install cmdk via bun**

```bash
cd /Users/logan/conductor/workspaces/nihongo-cards/tacoma && bun add cmdk
```

Expected output: package added to `dependencies` in `package.json`.

- [ ] **Step 2: Verify install**

```bash
ls node_modules/cmdk
```

Expected: directory exists with `dist/` inside.

- [ ] **Step 3: Commit**

```bash
git add package.json bun.lock
git commit -m "chore: add cmdk dependency"
```

---

### Task 2: Create CommandMenu component

**Files:**
- Create: `components/command-menu.tsx`

- [ ] **Step 1: Create the component**

Create `components/command-menu.tsx` with the following content:

```tsx
'use client';

import * as React from 'react';
import { Command } from 'cmdk';
import { useRouter } from 'next/navigation';
import { useHotkey } from '@tanstack/react-hotkeys';
import { SearchIcon } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

type NavEntry = {
    group: string;
    label: string;
    url: string;
    enabled: boolean;
};

const navEntries: NavEntry[] = [
    { group: 'Getting Started', label: 'Hiragana', url: '/hiragana', enabled: true },
    { group: 'Getting Started', label: 'Katakana', url: '/katakana', enabled: true },
    { group: 'Getting Started', label: 'Beginner Vocab', url: '/beginner-vocab', enabled: true },
    { group: 'Study', label: 'Flashcards', url: '/flashcards', enabled: true },
    // TODO: enable when quiz page is ready
    { group: 'Study', label: 'Quiz', url: '/quiz', enabled: false },
];

const groups = Array.from(new Set(navEntries.map((e) => e.group)));

export function CommandMenu() {
    const [open, setOpen] = React.useState(false);
    const router = useRouter();

    useHotkey('$mod+k', () => {
        setOpen((prev) => !prev);
    });

    const handleSelect = (url: string) => {
        setOpen(false);
        router.push(url);
    };

    return (
        <>
            {/* Trigger button */}
            <button
                onClick={() => setOpen(true)}
                className="border-input bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground flex h-9 w-48 items-center gap-2 rounded-md border px-3 text-sm transition-colors sm:w-56">
                <SearchIcon className="h-4 w-4 shrink-0" />
                <span className="flex-1 text-left">Search...</span>
                <kbd className="bg-muted text-muted-foreground pointer-events-none hidden h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium sm:flex">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </button>

            {/* Command palette dialog */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="p-0" showCloseButton={false}>
                    <Command className="[&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
                        <div className="border-b px-3">
                            <Command.Input
                                placeholder="Search pages..."
                                className="placeholder:text-muted-foreground flex h-12 w-full bg-transparent py-3 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>
                        <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden p-1">
                            <Command.Empty className="py-6 text-center text-sm">
                                No results found.
                            </Command.Empty>
                            {groups.map((group) => (
                                <Command.Group
                                    key={group}
                                    heading={group}
                                    className="text-foreground [&_[cmdk-group-heading]]:text-muted-foreground overflow-hidden p-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium">
                                    {navEntries
                                        .filter((e) => e.group === group)
                                        .map((entry) =>
                                            entry.enabled ? (
                                                <Command.Item
                                                    key={entry.url}
                                                    value={entry.label}
                                                    onSelect={() => handleSelect(entry.url)}
                                                    className="data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground relative flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none">
                                                    {entry.label}
                                                </Command.Item>
                                            ) : (
                                                <Command.Item
                                                    key={entry.url}
                                                    value={entry.label}
                                                    disabled={true}
                                                    aria-disabled="true"
                                                    className="relative flex cursor-not-allowed select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm opacity-50 outline-none">
                                                    {entry.label}
                                                    <Badge className="ml-auto">Soon</Badge>
                                                </Command.Item>
                                            )
                                        )}
                                </Command.Group>
                            ))}
                        </Command.List>
                    </Command>
                </DialogContent>
            </Dialog>
        </>
    );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/command-menu.tsx
git commit -m "feat: add CommandMenu component with cmdk"
```

---

### Task 3: Add CommandMenu to the header

**Files:**
- Modify: `components/layout/dashboard-layout.tsx`

- [ ] **Step 1: Update dashboard-layout.tsx**

The current header is:
```tsx
<header className="bg-background flex h-16 shrink-0 items-center gap-2 border-b px-4">
    <SidebarTrigger className="-ml-1" />
    <Separator
        orientation="vertical"
        className="mr-2 data-[orientation=vertical]:h-4"
    />
    <AppBreadcrumbs />
</header>
```

Replace it with:
```tsx
<header className="bg-background flex h-16 shrink-0 items-center gap-2 border-b px-4">
    <SidebarTrigger className="-ml-1" />
    <Separator
        orientation="vertical"
        className="mr-2 data-[orientation=vertical]:h-4"
    />
    <AppBreadcrumbs />
    <div className="ml-auto">
        <CommandMenu />
    </div>
</header>
```

Also add the import at the top of the file:
```tsx
import { CommandMenu } from '@/components/command-menu';
```

- [ ] **Step 2: Verify dev server starts without errors**

```bash
cd /Users/logan/conductor/workspaces/nihongo-cards/tacoma && bun dev
```

Expected: server starts, no TypeScript or import errors in the terminal.

- [ ] **Step 3: Commit**

```bash
git add components/layout/dashboard-layout.tsx
git commit -m "feat: add command menu trigger to app header"
```
