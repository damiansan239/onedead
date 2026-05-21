# Data Model: Game Platform Features

## PlayerProfile

**Purpose**: Stores player identity and profile metadata.

**Firestore path**: `players/{uid}`

**Fields**:

- `uid`: string, must match authenticated user id
- `displayName`: string, 3-24 visible characters after trimming
- `createdAt`: timestamp
- `updatedAt`: timestamp
- `profileVersion`: number
- `lastActiveAt`: timestamp

**Relationships**:

- Owns `players/{uid}/scores/{scoreId}`
- Owns `players/{uid}/stats/current`
- Owns `players/{uid}/adState/current`

**Validation Rules**:

- `displayName` is required for a saved profile and cannot be empty.
- Profile writes can only affect the authenticated player's document.
- Client UI must keep prior valid state when a save fails.

## ScoreRecord

**Purpose**: Represents one completed One-dead game result.

**Firestore path**: `players/{uid}/scores/{scoreId}`

**Fields**:

- `scoreId`: string
- `uid`: string, must match authenticated user id
- `gameName`: string
- `completedAt`: timestamp
- `startedAt`: timestamp
- `elapsedSeconds`: number, integer >= 0
- `trialCount`: number, integer >= 1
- `mainCodeHash`: string, optional hashed/derived value for debugging without
  storing raw secret code in analytics
- `outcome`: `"completed"`
- `scoreRank`: number, lower is better
- `highScoreStatus`: `"new" | "tied" | "not_beaten"`
- `syncStatus`: `"pending" | "synced" | "failed"` in local cache only

**Relationships**:

- Updates `PlayerStats.currentHighScore` when better than current score.
- Appends to local session history for offline/replay visibility.

**Validation Rules**:

- Score records are append-only from the player client after completion.
- `trialCount`, `elapsedSeconds`, and `scoreRank` must be positive bounded
  numeric values.
- The client must not allow edits to historical score records after sync.

## PlayerStats

**Purpose**: Stores aggregate progress for fast profile and high-score display.

**Firestore path**: `players/{uid}/stats/current`

**Fields**:

- `uid`: string, must match authenticated user id
- `totalCompletedGames`: number, integer >= 0
- `currentHighScoreId`: string or null
- `currentHighScoreRank`: number or null
- `currentHighScoreTrialCount`: number or null
- `currentHighScoreElapsedSeconds`: number or null
- `lastScoreId`: string or null
- `lastCompletedAt`: timestamp or null
- `highScoreUpdateCount`: number, integer >= 0
- `updatedAt`: timestamp

**Relationships**:

- Derived from `ScoreRecord` writes.
- Displayed in the player profile and high-score summary.

**Validation Rules**:

- Stats must never decrease `totalCompletedGames`.
- A high score update is valid only when the new score rank is better than or
  tied with the stored rank according to score comparison rules.
- UI must handle missing stats by showing an empty first-game state.

## AdPlacement

**Purpose**: Represents configured ad opportunities and runtime eligibility.

**Remote Config keys**:

- `ads_enabled`: boolean
- `ads_min_games_between_shows`: number
- `ads_min_minutes_between_shows`: number
- `ads_allowed_placements`: string list

**Local/Firestore path**: `players/{uid}/adState/current`

**Fields**:

- `uid`: string, must match authenticated user id
- `lastShownAt`: timestamp or null
- `gamesSinceLastAd`: number, integer >= 0
- `lastPlacement`: string or null
- `dismissedAt`: timestamp or null
- `updatedAt`: timestamp

**Allowed placement states**:

- `game_over`
- `replay_transition`
- `profile`
- `history`
- `summary`

**Forbidden placement states**:

- `active_guessing`
- `numeric_input`
- `paused_overlay_required_controls`

**Validation Rules**:

- Ads cannot be eligible during active guessing.
- Frequency limits must pass before an ad is shown.
- Ad load failure must set fallback state and continue the user flow.

## State Transitions

### ScoreRecord

```text
local_pending -> synced
local_pending -> failed
failed -> local_pending
```

### PlayerProfile

```text
empty -> saving -> saved
saved -> editing -> saving -> saved
saving -> error -> editing
```

### AdPlacement

```text
ineligible -> eligible -> loading -> shown -> dismissed -> ineligible
eligible -> loading -> unavailable -> ineligible
```
