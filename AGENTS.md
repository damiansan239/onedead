# Repository Guidelines

## Project Structure & Module Organization

This repository is a single Vite React application managed with Bun. Source code lives in `src/`.

- `src/components/`: React UI components such as `Game`, `History`, modals, and ad/profile UI.
- `src/game/`: game domain logic, session state, scoring, and shared game types. Keep gameplay rules here, not in components.
- `src/services/`: browser-facing services such as page visibility and Firebase-backed feature services.
- `src/repository.ts`, `src/firebase.ts`, `src/analytics.ts`: persistence, Firebase setup, and analytics integration.
- `public/`: static assets served by Vite.
- `firebase/`, `firebase.json`: Firebase Hosting and deployment config.
- `specs/001-game-platform-features/`: Spec Kit planning, contracts, and task artifacts for feature-sized work.

## Build, Test, and Development Commands

Install dependencies from the repository root:

```bash
bun install
```

Run the local development server:

```bash
bun run dev
```

Build TypeScript and the production Vite bundle:

```bash
bun run build
```

Run ESLint:

```bash
bun run lint
```

Preview a production build locally:

```bash
bun run preview
```

## Coding Style & Naming Conventions

Use TypeScript, ES modules, React function components, and hooks. Components use `.tsx` with PascalCase filenames, for example `Game.tsx`. Utilities, services, and domain files use camelCase or lower-case names, for example `pageVisibility.ts`, `repository.ts`, and `manager.ts`.

Keep UI rendering in `src/components/`, shared game behavior in `src/game/`, and Firebase/service integration outside components where practical. Use `eslint.config.js`; run linting before submitting changes.

## Testing Guidelines

No dedicated test script is currently configured. At minimum, run:

```bash
bun run build
bun run lint
```

For logic-heavy work, add focused tests near the relevant code if a runner is introduced. Use names such as `session.test.ts`, `manager.spec.ts`, or `scoring.test.ts`. Feature-sized changes should also follow `.specify/memory/constitution.md`, including user-story verification, UI consistency checks, and performance checks.

## Commit & Pull Request Guidelines

Recent history uses short messages such as `Update`; prefer descriptive imperative messages like `Add game history modal` or `Fix timer pause behavior`.

Pull requests should include a summary, testing performed, linked issues when applicable, and screenshots or recordings for UI changes. Call out Firebase, hosting, security rules, or data-storage changes.

## Security & Configuration Tips

Do not commit secrets, private Firebase credentials, Cloudflare tokens, or environment-specific deployment values. Keep sensitive deployment values in Firebase-managed or environment configuration.

<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read
`specs/001-game-platform-features/plan.md`
<!-- SPECKIT END -->
