# Contract: Firestore Security Rules

## Purpose

Define the security expectations for client-side Firestore access. Browser code
may validate input for user experience, but Firestore Security Rules are the
authorization boundary.

## Authentication

- All reads and writes under `players/{uid}` require `request.auth != null`.
- A player may read and write only documents where `{uid}` equals
  `request.auth.uid`.
- Anonymous Firebase Auth is acceptable for first-play continuity, with future
  upgrade support outside this feature.

## App Check

- Firestore access should require valid App Check tokens in deployed
  environments.
- Local emulator development may bypass App Check only for documented local
  testing.

## Document Rules

### `players/{uid}`

Allowed fields:

- `uid`
- `displayName`
- `createdAt`
- `updatedAt`
- `profileVersion`
- `lastActiveAt`

Rule expectations:

- `uid` must equal `{uid}` and `request.auth.uid`.
- `displayName` must be a string within accepted length limits.
- Unknown fields are rejected.

### `players/{uid}/scores/{scoreId}`

Allowed fields:

- `scoreId`
- `uid`
- `gameName`
- `completedAt`
- `startedAt`
- `elapsedSeconds`
- `trialCount`
- `mainCodeHash`
- `outcome`
- `scoreRank`
- `highScoreStatus`

Rule expectations:

- Create is allowed for the owning player.
- Update/delete is denied for synced historical scores unless a future migration
  explicitly allows repair.
- Numeric fields must be bounded and non-negative.
- `outcome` must be `completed`.
- `highScoreStatus` must be one of `new`, `tied`, or `not_beaten`.
- Unknown fields are rejected.

### `players/{uid}/stats/current`

Allowed fields:

- `uid`
- `totalCompletedGames`
- `currentHighScoreId`
- `currentHighScoreRank`
- `currentHighScoreTrialCount`
- `currentHighScoreElapsedSeconds`
- `lastScoreId`
- `lastCompletedAt`
- `highScoreUpdateCount`
- `updatedAt`

Rule expectations:

- Writes are allowed only for the owning player.
- Numeric counters cannot be negative.
- Unknown fields are rejected.
- Stats writes must be paired with score-record writes in client logic.

### `players/{uid}/adState/current`

Allowed fields:

- `uid`
- `lastShownAt`
- `gamesSinceLastAd`
- `lastPlacement`
- `dismissedAt`
- `updatedAt`

Rule expectations:

- Writes are allowed only for the owning player.
- `lastPlacement` must be one of the allowed placement names or null.
- Counters cannot be negative.
- Unknown fields are rejected.

## Emulator Validation Scenarios

- Unauthenticated user cannot read or write player data.
- Authenticated user cannot read another player's profile, scores, stats, or ad
  state.
- Authenticated user can create and update their own profile with valid fields.
- Invalid profile display names are rejected.
- Unknown fields are rejected for all protected documents.
- Historical score update/delete is rejected after create.
- Invalid ad placement name is rejected.
