# Implementation Plan: Game Platform Features

**Branch**: `001-game-platform-features` | **Date**: 2026-05-21 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-game-platform-features/spec.md`

**Note**: This plan incorporates the user direction to use Firestore as the
database, client-side data security, and Firebase services where they fit the
feature.

## Summary

Add personal high scores, a lightweight player profile, and controlled in-game
ad placement for One-dead. The implementation will keep game scoring rules in
`src/game/`, add a Firebase-backed profile/score repository in `src/services/`
or `src/repository.ts`, keep UI concerns in `src/components/`, and use Firebase
Auth, Firestore, Analytics, Remote Config, App Check, Messaging, and Hosting/PWA
capabilities where they directly support persistence, security, rollout,
measurement, and user experience.

Firestore is the source of truth for profile, aggregate stats, score records,
and ad placement state. The client may keep a local offline cache for
responsiveness, but writes must pass through authenticated Firebase clients and
Firestore Security Rules.

## Technical Context

**Language/Version**: TypeScript ~6.0.2, React 19.2.6, Vite 8.0.12, Bun workspace/root app

**Primary Dependencies**: Firebase JS SDK 12.13.0, Firestore, Firebase Auth,
Firebase Analytics, Firebase Remote Config, Firebase Messaging, Firebase App
Check, Dexie 4.4.2 for local/offline support, Headless UI, Heroicons, Tailwind
CSS 4.3.0

**Storage**: Cloud Firestore for durable profile, score, stats, and ad state;
IndexedDB/Dexie for local completed-session cache and offline resilience

**Testing**: `bun run build`, `bun run lint`, focused TypeScript tests to be
introduced for score comparison/profile validation/repository mapping, Firebase
Emulator Suite checks for Firestore Security Rules, and manual UI verification
for gameplay/profile/ad flows

**Target Platform**: Browser/PWA hosted on Firebase Hosting, with Firebase
client SDK services and optional notification support

**Project Type**: Single Vite React web application with Firebase backend
services

**Performance Goals**: High-score status visible within 2 seconds after game
completion; profile/high-score surfaces understandable within 5 seconds; active
guessing stays responsive with no ad insertion during input; profile and score
screens remain usable with at least 100 completed games

**Constraints**: Client-side Firestore access must be protected by Firebase
Auth, App Check, and Security Rules; ads must be gated by Remote Config and
frequency rules; offline or failed Firebase operations must not block gameplay;
no profile data beyond display identity and game progress in this feature

**Scale/Scope**: Personal high scores and lightweight profiles only; no public
leaderboards, paid ad removal, advertiser reporting, account recovery, parental
consent workflow, or cross-device migration beyond authenticated Firebase user
continuity

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Code Quality**: Affected code will stay in current real paths:
  `src/game/` for score comparison and completion classification,
  `src/services/` and `src/repository.ts` for Firebase/Dexie persistence,
  `src/components/` for profile, high score, and ad UI, and `src/firebase.ts`
  for Firebase service initialization. No game rule moves into UI components.
- **Testing**: Each user story has independent verification. Automated tests
  will cover score comparison, profile validation, stats aggregation, and
  Firestore data mapping. Firestore Security Rules require emulator validation.
  UI flows require manual keyboard/pointer/responsive verification.
- **User Experience**: New states include empty profile, loading profile,
  profile save error, high-score tie/new/not-beaten summaries, offline save
  pending, ad unavailable, ad frequency-limited, paused, and game-over states.
  Ads cannot cover active guessing controls.
- **Performance**: High-score summary within 2 seconds, profile stats visible
  within 5 seconds, no synchronous Firestore write blocking active play, and
  local cache fallback for offline or slow network cases.
- **Simplicity**: Firebase is already present and matches the user's requested
  project direction. The plan avoids a custom backend for this feature; the
  only backend policy surface is Firestore Security Rules.

**Initial Gate Result**: PASS with one documented complexity item for repository
layout drift between older guidance and the current checked-out app structure.

## Project Structure

### Documentation (this feature)

```text
specs/001-game-platform-features/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── firebase-client-services.md
│   └── firestore-security-rules.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── App.tsx
├── analytics.ts
├── firebase.ts
├── repository.ts
├── components/
│   ├── Game.tsx
│   ├── History.tsx
│   ├── ProfilePanel.tsx
│   ├── HighScoreSummary.tsx
│   └── AdPlacement.tsx
├── game/
│   ├── manager.ts
│   ├── session.ts
│   ├── scoring.ts
│   └── types.ts
└── services/
    ├── firebaseProfile.ts
    ├── firebaseScores.ts
    ├── adPolicy.ts
    └── pageVisibility.ts

firestore.rules
firestore.indexes.json
```

**Structure Decision**: Use the actual current root Vite app layout (`src/`)
instead of the stale `apps/web/` guidance. Keep domain scoring in `src/game/`,
Firebase and persistence services outside components, and UI rendering in
`src/components/`.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Current source path is `src/` while constitution/runtime guidance mentions `apps/web/src/` | The checked-out application actually lives at repository-root `src/`; planning against nonexistent `apps/web` paths would make tasks unusable | Moving the app into `apps/web` during this feature would create a broad unrelated migration and increase risk |
| Firebase client writes require Security Rules and emulator validation | User explicitly requested Firestore with client-side data security; rules are the enforcement boundary | A custom API would centralize authorization but adds backend scope and duplicates Firebase capabilities already requested |

## Phase 0: Research Summary

See [research.md](./research.md). Research resolved Firebase service choices,
Firestore document structure, client-side security, offline behavior, ad
frequency policy, and testing strategy.

## Phase 1: Design Summary

See [data-model.md](./data-model.md), [contracts/firebase-client-services.md](./contracts/firebase-client-services.md),
[contracts/firestore-security-rules.md](./contracts/firestore-security-rules.md), and
[quickstart.md](./quickstart.md).

## Post-Design Constitution Check

- **Code Quality**: PASS. Data model separates profile, score, stats, and ad
  state. Contracts keep Firebase policy and client service responsibilities
  explicit.
- **Testing**: PASS. Quickstart includes build, lint, focused behavior tests,
  manual UI checks, and Firebase emulator Security Rules checks.
- **User Experience**: PASS. Design includes loading, empty, error, pending,
  offline, game-over, and ad-unavailable states.
- **Performance**: PASS. Firestore writes are asynchronous, local cache is
  allowed, and aggregate stats avoid scanning full score history for common UI.
- **Simplicity**: PASS. Uses Firebase services already present/requested and
  avoids a custom API layer for this feature.
