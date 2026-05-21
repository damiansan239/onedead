# Repository Guidelines

## Project Structure & Module Organization

This is a Bun workspace with app packages under `apps/*`.

- `apps/web/`: React + Vite frontend. Main code lives in `apps/web/src/`.
- `apps/web/src/components/`: UI components such as `Game`, `History`, and modal components.
- `apps/web/src/game/`: game domain logic, session state, and shared game types.
- `apps/web/src/services/`: browser-facing services such as page visibility handling.
- `apps/web/public/`: static web assets including icons and favicons.
- `apps/api/`: Cloudflare Worker API using Hono. Entry point is `apps/api/src/index.ts`.
- `apps/web/old/`: legacy Vite/React scaffold files; avoid extending unless intentionally migrating old code.

## Build, Test, and Development Commands

Install dependencies from the repository root:

```bash
bun install
```

Run the web app locally:

```bash
bun --cwd apps/web run dev
```

Build the web app:

```bash
bun --cwd apps/web run build
```

Lint the web app:

```bash
bun --cwd apps/web run lint
```

Run the API worker locally:

```bash
bun --cwd apps/api run dev
```

Deploy the API worker:

```bash
bun --cwd apps/api run deploy
```

## Coding Style & Naming Conventions

Use TypeScript and ES modules throughout. Frontend components use `.tsx` and PascalCase filenames, for example `Game.tsx`. Utility, service, and domain files use camelCase or lower-case names, for example `pageVisibility.ts`, `repository.ts`, and `manager.ts`.

Prefer React function components and hooks for UI code. Keep game rules in `apps/web/src/game/` rather than embedding them in components. The web app uses ESLint via `apps/web/eslint.config.js`; run linting before submitting changes.

## Testing Guidelines

No test framework or test scripts are currently configured. For logic-heavy changes, add focused tests alongside the code or in a nearby test directory if a runner is introduced. Use clear names such as `session.test.ts` or `manager.spec.ts`. At minimum, run `bun --cwd apps/web run build` and `bun --cwd apps/web run lint` before opening a PR.

## Commit & Pull Request Guidelines

This checkout does not include git history, so no existing commit convention can be verified. Use short, imperative commit messages such as `Add game history modal` or `Fix timer pause behavior`.

Pull requests should include a concise description, testing performed, and screenshots or recordings for UI changes. Link related issues when available and call out configuration, deployment, or data-storage changes.

## Security & Configuration Tips

Do not commit secrets, Firebase credentials beyond intended public client config, or Cloudflare tokens. Keep deployment-specific settings in Wrangler, Firebase, or environment-managed configuration rather than hard-coding them in source files.

<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan
<!-- SPECKIT END -->
