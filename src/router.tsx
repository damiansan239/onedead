import React from "react";
import { createMemoryRouter, useOutletContext } from "react-router";

import Game from "./components/Game";
import History from "./components/History";
import GameLayout from "./components/GameLayout";
import HomeScreen from "./components/HomeScreen";
import HighScoresPage from "./components/HighScoresPage";
import type { AppState, Result } from "@/game/types";
import type Manager from "@/game/manager";

// ---------------------------------------------------------------------------
// Shared outlet context – provided by AppContent to all child routes.
// ---------------------------------------------------------------------------

export interface AppOutletContext {
  // Navigation helpers
  startGame: () => void;
  openHighScores: () => void;
  continueGame: () => void;
  canContinue: boolean;
  playMultiplayer: () => void;
  navigateBack: () => void;

  // Game state
  manager: Manager | null;
  error: Error | null;
  state: AppState;
  result: Result | null;
  clear: () => void;
  enterCharacter: (char: string) => void;
  playTestCode: (state: AppState) => void;

  // Game layout state
  started: boolean;
  setStarted: React.Dispatch<React.SetStateAction<boolean>>;
  countdownActive: boolean;
  handleCountdownComplete: () => void;
  showModal: boolean;
  showModalDialog: boolean;
  setShowModalDialog: React.Dispatch<React.SetStateAction<boolean>>;
  timerState: boolean;
  timeElapsed: number;
  replayGame: () => void;
  shareApp: () => void;
}

/** Typed hook for consuming the shared outlet context in child routes. */
export const useAppOutletContext = () => useOutletContext<AppOutletContext>();

// ---------------------------------------------------------------------------
// Route leaf components – thin wrappers that pull props from outlet context.
// Keeping them here co-locates routing logic in a single file.
// ---------------------------------------------------------------------------

const HomeRoute = () => {
  const ctx = useAppOutletContext();
  return (
    <HomeScreen
      onStartNewGame={ctx.startGame}
      onHighScores={ctx.openHighScores}
      onContinueGame={ctx.continueGame}
      canContinue={ctx.canContinue}
      onPlayMultiplayer={ctx.playMultiplayer}
    />
  );
};

const HighScoresRoute = () => {
  const ctx = useAppOutletContext();
  return <HighScoresPage onBack={ctx.navigateBack} />;
};

const GameRoute = () => {
  const ctx = useAppOutletContext();
  return (
    <Game
      error={ctx.error}
      clear={ctx.clear}
      state={ctx.state}
      result={ctx.result}
      playTestCode={ctx.playTestCode}
      enterCharacter={ctx.enterCharacter}
    />
  );
};

const HistoryRoute = () => {
  const ctx = useAppOutletContext();
  return <History manager={ctx.manager} />;
};

// ---------------------------------------------------------------------------
// Router – single source of truth for all application routes.
//
// Route tree:
//   /                → AppContent (root layout, provides outlet context)
//     (index)        → HomeRoute
//     /high-scores   → HighScoresRoute
//     /game          → GameLayout  (ad shell + header + modals)
//       (index)      → GameRoute
//       /history     → HistoryRoute
// ---------------------------------------------------------------------------

export const router = createMemoryRouter([
  {
    path: "/",
    // AppContent is loaded lazily to avoid a circular import:
    //   router.tsx → AppContent.tsx → router.tsx (for AppOutletContext type)
    // The type-only import in AppContent.tsx is safe; only the runtime
    // createMemoryRouter call would create a cycle.
    lazy: async () => {
      const { default: AppContent } = await import("./AppContent");
      return { Component: AppContent };
    },
    children: [
      {
        index: true,
        element: <HomeRoute />,
      },
      {
        path: "high-scores",
        element: <HighScoresRoute />,
      },
      {
        path: "game",
        element: <GameLayout />,
        children: [
          {
            index: true,
            element: <GameRoute />,
          },
          {
            path: "history",
            element: <HistoryRoute />,
          },
        ],
      },
    ],
  },
]);

export default router;
