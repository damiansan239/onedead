# Contract: Firebase Client Services

## Purpose

Define the client-facing service contracts needed for profile, high-score, and
ad behavior. These contracts are implemented inside the browser app and backed
by Firebase services.

## Profile Service

### `getCurrentProfile()`

**Returns**: Current `PlayerProfile` or empty profile state.

**Behavior**:

- Resolves the authenticated player's profile.
- Creates a local empty state when the player has not saved a profile.
- Returns an error state without blocking gameplay when profile data cannot be
  loaded.

### `saveProfile(input)`

**Input**:

- `displayName`: string

**Returns**: Saved `PlayerProfile`.

**Validation**:

- Trim display name.
- Require 3-24 visible characters.
- Reject unsupported control characters.

**Failure behavior**:

- Keep the last valid profile visible.
- Show a user-facing save error.

## Score Service

### `recordCompletedGame(history)`

**Input**:

- Completed game history
- Elapsed time
- Trial count
- Current player identity

**Returns**: Score summary with `highScoreStatus`.

**Behavior**:

- Calculate deterministic score rank.
- Save a local pending score immediately.
- Write score record and aggregate stats to Firestore asynchronously.
- Return `new`, `tied`, or `not_beaten` status for the completion summary.

**Failure behavior**:

- Preserve local pending score.
- Allow replay/start-new-game without waiting for Firestore.
- Surface sync status in profile or summary surfaces.

## Stats Service

### `getPlayerStats()`

**Returns**: Current aggregate stats or first-game empty state.

**Behavior**:

- Reads `players/{uid}/stats/current`.
- Falls back to local cache when remote data is unavailable.
- Does not scan all historical scores for common profile display.

## Ad Policy Service

### `getAdEligibility(context)`

**Input**:

- Current game state
- Placement name
- Last ad state
- Remote Config values

**Returns**: `eligible`, `ineligible`, or `unavailable` with a reason.

**Rules**:

- Active guessing is always ineligible.
- Required controls must remain accessible.
- Frequency limits must pass.
- Remote Config can disable all ads or individual placements.

### `recordAdShown(placement)`

**Behavior**:

- Updates local ad state.
- Writes player ad state to Firestore when authenticated.
- Logs analytics event without storing unnecessary profile data.

## Analytics Events

- `profile_saved`
- `score_recorded`
- `high_score_updated`
- `ad_eligible`
- `ad_shown`
- `ad_unavailable`
- `ad_dismissed`

## Remote Config Defaults

- `ads_enabled`: `false`
- `ads_min_games_between_shows`: `2`
- `ads_min_minutes_between_shows`: `10`
- `ads_allowed_placements`: `game_over,profile,summary`
- `profile_enabled`: `true`
- `remote_scores_enabled`: `true`
