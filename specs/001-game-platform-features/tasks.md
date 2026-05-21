---
description: "Task list for Firebase-backed high scores, profiles, and in-game ads"
---

# Tasks: Game Platform Features

**Input**: Design documents from `/specs/001-game-platform-features/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Automated behavior tests and Firestore Security Rules emulator checks
are required by the implementation plan. Manual verification tasks are included
for each user story because the feature has visible gameplay, profile, and ad
flows.

**Organization**: Tasks are grouped by user story so high scores can ship as
the MVP before profile and ad work.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel because it affects different files or depends
  only on completed prerequisites
- **[Story]**: User story label for story phases only
- Each task includes an exact file path

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare Firebase, testing, and source layout needed by all stories.

- [ ] T001 Add Firebase Auth, Firestore, App Check, and Remote Config exports in src/firebase.ts
- [ ] T002 [P] Add Firebase emulator and Firestore scripts to package.json
- [ ] T003 [P] Create shared platform type definitions for profile, score, stats, and ad state in src/game/types.ts
- [ ] T004 [P] Create test directory placeholders in tests/game/.gitkeep, tests/services/.gitkeep, and tests/security/.gitkeep
- [ ] T005 [P] Add Firebase emulator configuration for Firestore/Auth in firebase.json

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish identity, Firestore rules, local persistence, and service
boundaries before any user story implementation.

**CRITICAL**: No user story work should begin until this phase is complete.

- [ ] T006 Implement anonymous Firebase sign-in helper and auth state handling in src/services/firebaseAuth.ts
- [ ] T007 Implement Firestore path builders and document converters for players, scores, stats, and ad state in src/services/firestorePaths.ts
- [ ] T008 Extend local Dexie schema for pending scores, profile cache, stats cache, and ad state in src/repository.ts
- [ ] T009 Create Firestore Security Rules for player-owned profile, score, stats, and ad-state documents in firestore.rules
- [ ] T010 Create Firestore indexes file for planned player subcollections in firestore.indexes.json
- [ ] T011 [P] Add Firebase Security Rules emulator tests for ownership, field allowlists, and denied unauthenticated access in tests/security/firestoreRules.test.ts
- [ ] T012 [P] Add analytics event wrappers for profile, score, high score, and ad events in src/analytics.ts
- [ ] T013 [P] Add reusable async status and sync-state helpers in src/services/syncState.ts

**Checkpoint**: Firebase identity, persistence paths, local cache, rules, and
shared types are ready for user-story work.

---

## Phase 3: User Story 1 - Track Personal High Scores (Priority: P1) MVP

**Goal**: Record completed-game results, compare them deterministically, and
show whether the latest result is a new, tied, or unbeaten high score.

**Independent Test**: Complete multiple games with different trial counts and
elapsed times, then verify the best score persists and updates only when the new
result is better.

### Tests and Verification for User Story 1

- [ ] T014 [P] [US1] Add failing tests for score ranking, tie handling, and high-score status in tests/game/scoring.test.ts
- [ ] T015 [P] [US1] Add failing tests for completed-game score mapping and local pending sync state in tests/services/firebaseScores.test.ts
- [ ] T016 [P] [US1] Document manual high-score verification steps in specs/001-game-platform-features/quickstart.md

### Implementation for User Story 1

- [ ] T017 [P] [US1] Implement score ranking and high-score status helpers in src/game/scoring.ts
- [ ] T018 [US1] Update game completion data to expose elapsed seconds and trial count consistently in src/game/manager.ts
- [ ] T019 [US1] Update session history typing for score persistence fields in src/game/types.ts
- [ ] T020 [US1] Implement Firestore-backed score and stats service with local pending fallback in src/services/firebaseScores.ts
- [ ] T021 [US1] Integrate score recording into the complete-game listener in src/App.tsx
- [ ] T022 [P] [US1] Create high-score summary UI for new, tied, not-beaten, pending, and failed sync states in src/components/HighScoreSummary.tsx
- [ ] T023 [US1] Render the high-score summary in the completion flow in src/components/completeModal.tsx
- [ ] T024 [US1] Log score recorded and high score updated events from completed-game flow in src/analytics.ts
- [ ] T025 [US1] Run high-score tests and update any test fixtures in tests/game/scoring.test.ts

**Checkpoint**: User Story 1 is fully functional and independently testable.

---

## Phase 4: User Story 2 - Manage Player Profile (Priority: P2)

**Goal**: Let players create or edit a lightweight display profile and view
basic stats tied to their high-score progress.

**Independent Test**: Create or edit a profile, complete a game, and verify the
profile identity and stats appear consistently in profile, score, and summary
surfaces.

### Tests and Verification for User Story 2

- [ ] T026 [P] [US2] Add failing tests for display-name validation and profile state transitions in tests/services/firebaseProfile.test.ts
- [ ] T027 [P] [US2] Add failing tests for profile stats aggregation from score updates in tests/services/playerStats.test.ts
- [ ] T028 [P] [US2] Document manual profile creation, edit, invalid-name, and failed-save checks in specs/001-game-platform-features/quickstart.md

### Implementation for User Story 2

- [ ] T029 [P] [US2] Implement profile validation helpers and profile state types in src/services/firebaseProfile.ts
- [ ] T030 [US2] Implement getCurrentProfile and saveProfile using Firebase Auth and Firestore in src/services/firebaseProfile.ts
- [ ] T031 [US2] Extend score service to update aggregate player stats after completed games in src/services/firebaseScores.ts
- [ ] T032 [P] [US2] Create profile panel UI with empty, loading, editing, saving, saved, and error states in src/components/ProfilePanel.tsx
- [ ] T033 [US2] Add profile entry point and profile panel state wiring in src/App.tsx
- [ ] T034 [US2] Display profile name and stats in high-score summary surfaces in src/components/HighScoreSummary.tsx
- [ ] T035 [US2] Log profile saved events without extra personal data in src/analytics.ts
- [ ] T036 [US2] Run profile and stats tests and update any test fixtures in tests/services/firebaseProfile.test.ts

**Checkpoint**: User Stories 1 and 2 both work independently.

---

## Phase 5: User Story 3 - Show Respectful In-Game Ads (Priority: P3)

**Goal**: Gate ads through Remote Config and local frequency rules so ads appear
only at natural breaks and never block active guessing controls.

**Independent Test**: Play through start, active guessing, pause, game over,
profile, history, and replay flows with ads enabled and disabled; verify ads
never interrupt active guessing or block required controls.

### Tests and Verification for User Story 3

- [ ] T037 [P] [US3] Add failing tests for ad eligibility, forbidden active-guessing placements, and frequency limits in tests/services/adPolicy.test.ts
- [ ] T038 [P] [US3] Add failing tests for Remote Config defaults and ad-state mapping in tests/services/adPolicyConfig.test.ts
- [ ] T039 [P] [US3] Document manual mobile and desktop ad placement checks in specs/001-game-platform-features/quickstart.md

### Implementation for User Story 3

- [ ] T040 [P] [US3] Add Remote Config defaults for ads_enabled, allowed placements, and frequency limits in src/firebase.ts
- [ ] T041 [P] [US3] Implement ad eligibility and frequency policy service in src/services/adPolicy.ts
- [ ] T042 [US3] Replace direct ad insertion with placement-aware ad component in src/components/AdPlacement.tsx
- [ ] T043 [US3] Integrate AdPlacement into game-over, profile, history, and summary surfaces in src/App.tsx
- [ ] T044 [US3] Remove or gate active-gameplay ad slots so they cannot cover guessing controls in src/App.tsx
- [ ] T045 [US3] Persist and sync per-player ad state in src/services/adPolicy.ts
- [ ] T046 [US3] Log ad eligible, shown, unavailable, and dismissed events in src/analytics.ts
- [ ] T047 [US3] Run ad policy tests and update any test fixtures in tests/services/adPolicy.test.ts

**Checkpoint**: All user stories are independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verify the complete feature, security posture, performance, and
documentation before release.

- [ ] T048 [P] Update Firebase client service contract notes with final implementation decisions in specs/001-game-platform-features/contracts/firebase-client-services.md
- [ ] T049 [P] Update Firestore Security Rules contract notes with final rules coverage in specs/001-game-platform-features/contracts/firestore-security-rules.md
- [ ] T050 Run Firestore/Auth emulator Security Rules checks and record outcomes in specs/001-game-platform-features/quickstart.md
- [ ] T051 Run `bun run build` and record the result in specs/001-game-platform-features/quickstart.md
- [ ] T052 Run `bun run lint` and record the result in specs/001-game-platform-features/quickstart.md
- [ ] T053 Verify profile and high-score surfaces remain responsive with 100 local completed games in specs/001-game-platform-features/quickstart.md
- [ ] T054 Capture screenshots or recordings for profile, high-score summary, and ad placement states in specs/001-game-platform-features/quickstart.md
- [ ] T055 Review changed files for constitution boundary compliance and note any exceptions in specs/001-game-platform-features/plan.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup completion and blocks all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational; this is the MVP.
- **User Story 2 (Phase 4)**: Depends on Foundational and can be implemented after or alongside US1, but final stats integration depends on US1 score service.
- **User Story 3 (Phase 5)**: Depends on Foundational and can be implemented after or alongside US1/US2, but final placement integration benefits from profile/history surfaces.
- **Polish (Phase 6)**: Depends on all desired stories being complete.

### User Story Dependencies

- **US1 Track Personal High Scores**: No dependency on other user stories.
- **US2 Manage Player Profile**: Uses stats produced by US1, but profile create/edit can be built independently after Foundational.
- **US3 Show Respectful In-Game Ads**: Uses shared auth/ad state and app surfaces; core ad policy is independent after Foundational.

### Within Each User Story

- Write failing tests first.
- Implement domain/service logic before UI integration.
- Integrate UI after services expose stable states.
- Complete story-specific manual verification before moving to the next priority.

---

## Parallel Opportunities

- Setup tasks T002-T005 can run in parallel after T001 is understood.
- Foundational tasks T011-T013 can run in parallel after T006-T010 are started.
- US1 tests T014-T016 can run in parallel; T017 and T022 can run in parallel after tests exist.
- US2 tests T026-T028 can run in parallel; T029 and T032 can run in parallel after tests exist.
- US3 tests T037-T039 can run in parallel; T040 and T041 can run in parallel after tests exist.
- Contract documentation tasks T048-T049 can run in parallel during final polish.

---

## Parallel Example: User Story 1

```bash
Task: "T014 [US1] Add failing tests for score ranking, tie handling, and high-score status in tests/game/scoring.test.ts"
Task: "T015 [US1] Add failing tests for completed-game score mapping and local pending sync state in tests/services/firebaseScores.test.ts"
Task: "T016 [US1] Document manual high-score verification steps in specs/001-game-platform-features/quickstart.md"
```

## Parallel Example: User Story 2

```bash
Task: "T026 [US2] Add failing tests for display-name validation and profile state transitions in tests/services/firebaseProfile.test.ts"
Task: "T027 [US2] Add failing tests for profile stats aggregation from score updates in tests/services/playerStats.test.ts"
Task: "T032 [US2] Create profile panel UI with empty, loading, editing, saving, saved, and error states in src/components/ProfilePanel.tsx"
```

## Parallel Example: User Story 3

```bash
Task: "T037 [US3] Add failing tests for ad eligibility, forbidden active-guessing placements, and frequency limits in tests/services/adPolicy.test.ts"
Task: "T038 [US3] Add failing tests for Remote Config defaults and ad-state mapping in tests/services/adPolicyConfig.test.ts"
Task: "T040 [US3] Add Remote Config defaults for ads_enabled, allowed placements, and frequency limits in src/firebase.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 setup.
2. Complete Phase 2 foundational Firebase identity, rules, local cache, and shared types.
3. Complete Phase 3 high-score tracking.
4. Stop and validate US1 independently before profile or ad work.

### Incremental Delivery

1. Ship US1 high scores as the first usable progression loop.
2. Add US2 profile identity and stats once high-score data is stable.
3. Add US3 ads only after game-over/profile/history surfaces are verified.
4. Run final polish and security checks before release.

### Team Parallel Strategy

With multiple implementers:

1. One person owns Firebase/Auth/Rules foundation.
2. One person owns game scoring and high-score service.
3. One person owns profile UI and validation after foundational paths exist.
4. One person owns ad policy and placement after Remote Config defaults exist.

---

## Notes

- Keep game rules in `src/game/`; do not move scoring decisions into components.
- Treat Firestore Security Rules as the authorization boundary.
- Keep ads disabled by default until manual placement checks pass.
- Use root commands `bun run build` and `bun run lint`; this feature uses the current root Vite app layout, not `apps/web`.
