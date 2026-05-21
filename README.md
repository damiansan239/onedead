# one-dead

This is a Bun workspace with a React/Vite web app in `apps/web` and a
Cloudflare Worker API in `apps/api`.

To install dependencies from the repository root:

```bash
bun install
```

To run the web app locally:

```bash
bun --cwd apps/web run dev
```

To check web changes before release:

```bash
bun --cwd apps/web run build
bun --cwd apps/web run lint
```

Project work is governed by `.specify/memory/constitution.md`, which defines
the required standards for code quality, testing, user experience consistency,
and performance.
