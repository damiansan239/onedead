# Quickstart: Game Platform Features

## Prerequisites

- Install dependencies from the repository root with `bun install`.
- Use the existing Firebase project configuration in `src/firebase.ts`.
- Install or enable Firebase CLI tooling before Security Rules emulator checks.

## Local Development

1. Start the app:

   ```bash
   bun run dev
   ```

2. Verify the app can start a game, accept guesses, complete a game, and replay
   without requiring a profile.

3. Enable Firebase Auth locally with anonymous sign-in for first-play identity.

4. Add Firestore-backed profile and score services while keeping gameplay
   responsive if Firestore is offline or slow.

5. Gate ads through Remote Config defaults so development can disable all ads by
   default.

## Firebase Emulator Checks

1. Add Firestore Security Rules and indexes:

   ```bash
   firebase emulators:start --only firestore,auth
   ```

2. Run Security Rules checks for:

   - unauthenticated access denied
   - cross-user profile/score/stats/ad-state access denied
   - valid own-profile save allowed
   - invalid display names rejected
   - score create allowed and historical score update/delete denied
   - invalid ad placement rejected

## Verification Gates

Run before release:

```bash
bun run build
bun run lint
```

Additional feature verification:

- Complete several games and confirm high score status: new, tied, and not
  beaten.
- Create and edit a profile; verify invalid names keep prior valid profile data.
- Refresh after game completion and confirm score/profile state returns.
- Simulate offline or failed Firestore writes and confirm replay is not blocked.
- Confirm ads never cover active guessing controls on mobile or desktop.
- Confirm Remote Config can disable ads without code changes.
- Confirm profile/high-score surfaces remain responsive with at least 100 local
  completed games.

## Rollout Notes

- Default `ads_enabled` to `false` until placement behavior is verified.
- Keep public leaderboards out of this rollout.
- Do not collect profile fields beyond display name and game progress.
- Record screenshots or short recordings for profile, high-score summary, and
  ad placement states before merge.
