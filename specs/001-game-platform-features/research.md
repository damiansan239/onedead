# Research: Game Platform Features

## Firebase Service Strategy

**Decision**: Use Firebase Auth, Cloud Firestore, Analytics, Remote Config,
App Check, Messaging, and Hosting/PWA support where they serve this feature.

**Rationale**: Firebase is already configured in the app and the user requested
Firestore plus broad Firebase usage. Auth supplies a stable player identity,
Firestore stores profile/score data, Analytics measures game and ad outcomes,
Remote Config gates ads and feature rollout, App Check reduces unauthorized
client abuse, Messaging supports future opt-in retention prompts, and Hosting
fits the existing PWA deployment model.

**Alternatives considered**:

- Firestore only: simpler, but weak identity and rollout controls.
- Custom API plus Firestore: stronger server enforcement, but outside this
  feature's current scope and redundant for personal profiles/scores.
- Dexie-only local storage: fastest to implement, but does not meet the
  Firestore requirement or authenticated continuity goal.

## Firestore Data Ownership

**Decision**: Store user-owned documents under `players/{uid}` with nested
collections for `scores`, `stats`, and `adState`.

**Rationale**: Per-user paths are straightforward to secure with Firestore
Security Rules and map naturally to personal high scores and profiles. Aggregate
stats avoid scanning every score record for common UI.

**Alternatives considered**:

- Global `scores` collection keyed by `uid`: useful for leaderboards, but public
  ranking is out of scope and rules become easier to misconfigure.
- Single profile document containing all score history: simple initially, but
  grows without bound and risks write conflicts.

## Client-Side Data Security

**Decision**: Require authenticated user identity, App Check enforcement, strict
Security Rules, client-side validation, and emulator tests for profile, score,
stats, and ad-state writes.

**Rationale**: Client-side validation improves UX, but Firestore Security Rules
must be the trust boundary because browser clients are not inherently trusted.
Rules should enforce user ownership, field allowlists, type checks, score
immutability where practical, and bounded ad-state/profile updates.

**Alternatives considered**:

- Trust client validation only: rejected because users can bypass browser code.
- Cloud Functions validation for every write: stronger central logic, but adds
  backend scope; reserve for public leaderboard or anti-cheat work.

## Score Comparison and Stats

**Decision**: Define a deterministic `scoreRank` derived from completed-game
history, with better scores based on fewer trials first and shorter elapsed time
as the tie-breaker. Persist both the raw completed score and aggregate high
score status.

**Rationale**: The current game tracks trial count and elapsed time. This gives
players a clear, testable ranking without changing gameplay.

**Alternatives considered**:

- Time-only ranking: can reward guessing quickly over strategic efficiency.
- Trials-only ranking: creates many ties and ignores pacing.
- Points formula: flexible but less transparent for the first high-score system.

## Offline and Slow Network Behavior

**Decision**: Gameplay completion should save locally immediately and queue or
retry Firestore writes asynchronously. UI should show pending/synced/error
status without blocking replay.

**Rationale**: One-dead should remain playable when Firestore is slow or
unavailable. The current app already uses Dexie for session history, so local
cache is a natural fallback.

**Alternatives considered**:

- Firestore write before showing completion: simpler consistency, but violates
  responsiveness goals.
- Local-only until app restart: risks silent data loss and poor continuity.

## In-Game Ad Policy

**Decision**: Gate ad visibility with Remote Config and a local frequency policy.
Eligible placements are game-over, replay transition, profile, history, and
summary surfaces. Active guessing is never eligible.

**Rationale**: Ads already exist in the app, but the feature requires respectful
placement. Remote Config supports rollout and kill switches without redeploying.

**Alternatives considered**:

- Persistent side/banner ads during gameplay: can be acceptable on wide screens,
  but must not cover controls or distract on small screens.
- Rewarded ads: outside current scope because ads are not tied to gameplay
  rewards in the specification.

## Testing Strategy

**Decision**: Add focused behavior tests for score ranking, profile validation,
stats aggregation, repository mapping, and ad eligibility; validate Security
Rules with the Firebase Emulator Suite; keep build/lint and manual UI checks as
release gates.

**Rationale**: The feature spans domain rules, persistence, and UX. Behavior
tests cover deterministic logic, emulator checks cover security, and manual
checks cover ad and profile interaction quality.

**Alternatives considered**:

- Manual-only testing: insufficient for score/security regressions.
- Full end-to-end automation immediately: useful later, but likely too broad
  before the core service boundaries are implemented.
