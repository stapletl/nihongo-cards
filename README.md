# Nihongo Cards

[![Cloudflare Deploy](https://img.shields.io/website?url=https%3A%2F%2Fnihongo-cards.com&style=for-the-badge&logo=cloudflare&logoColor=white&label=Cloudflare&up_message=deployed&down_message=down)](https://nihongo-cards.com/) [![CI](https://img.shields.io/github/actions/workflow/status/stapletl/nihongo-cards/ci.yml?branch=main&style=for-the-badge&logo=githubactions&logoColor=white&label=CI)](https://github.com/stapletl/nihongo-cards/actions/workflows/ci.yml) [![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](./LICENSE)

[nihongo-cards.com](https://nihongo-cards.com/) A modern Japanese learning application for mastering Hiragana and Katakana through interactive flashcards and quizzes. The site is fully prerendered to static HTML, so it runs anywhere static files can be served.

## Features

- Interactive flashcards for Japanese learning
- Hiragana and Katakana practice
- Modern, responsive UI built with shadcn/ui components
- Light/Dark mode support

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

## Contributing

The goal for this app is to have an extremely narrow scope and be virtually no work to maintain. If you have suggestions, comments, concerns, feel free to open an Issue. It is unlikely that large features will be added or large PRs will be reviewed.

## License

This project is licensed under the [MIT License](LICENSE).

Nihongo Cards uses [KanjiVG](http://kanjivg.tagaini.net) by Ulrich Apel, licensed under [CC BY-SA 3.0](http://creativecommons.org/licenses/by-sa/3.0/).
