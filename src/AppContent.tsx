/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  getAuth,
  onAuthStateChanged,
  signInWithCustomToken,
} from "firebase/auth";
import React from "react";
import { Outlet, useBlocker, useLocation, useNavigate } from "react-router";
import Manager from "@/game/manager";
import type { AppAction, AppState, Result } from "@/game/types";
import AppAnalytics from "./analytics";
import { sessionRepository } from "./repository";
import type { AppOutletContext } from "./router";
import PageVisibilityService from "./services/pageVisibility";
import startupSoundService from "./services/startupSound";
import { addValue, generateName } from "./utils";

const AppContent = (): React.ReactElement => {
  const reducer = (state: AppState, action: AppAction): AppState => {
    switch (action.type) {
      case "input":
        return addValue(action.value as string, state);
      case "clear":
        return "_ _ _ _";
      default:
        return state;
    }
  };

  const navigate = useNavigate();
  const location = useLocation();

  // Play the startup sound once when the app loads.
  React.useEffect(() => {
    startupSoundService.play();
  }, []);

  const [error, setError] = React.useState<Error | null>(null);
  const [started, setStarted] = React.useState<boolean>(false);
  const [state, dispatch] = React.useReducer(reducer, "_ _ _ _");
  const [timeElapsed, setTimeElapsed] = React.useState<number>(0);
  const [result, setResult] = React.useState<Result | null>(null);
  const [showModal, setShowModal] = React.useState<boolean>(false);
  const [timerState, setTimerState] = React.useState<boolean>(false);
  const [gameName, setGameName] = React.useState<string | null>(null);
  const [shouldClear, setShouldClear] = React.useState<boolean>(false);
  const [_currentUser, setCurrentUser] = React.useState<string | null>(null);
  const [showModalDialog, setShowModalDialog] = React.useState<boolean>(false);
  const [countdownActive, setCountdownActive] = React.useState<boolean>(false);

  const blocker = useBlocker(
    React.useCallback(
      ({ currentLocation, nextLocation }) => {
        const isLeavingGame =
          currentLocation.pathname.startsWith("/game") &&
          !nextLocation.pathname.startsWith("/game");
        return isLeavingGame && started && !showModal;
      },
      [started, showModal],
    ),
  );

  React.useEffect(() => {
    if (blocker.state === "blocked") {
      const confirmQuit = window.confirm(
        "Are you sure you want to quit the game? Your progress will be lost.",
      );
      if (confirmQuit) {
        blocker.proceed();
      } else {
        blocker.reset();
      }
    }
  }, [blocker]);

  const pageVisibility = React.useMemo(() => new PageVisibilityService(), []);
  const manager = React.useMemo(
    () => (gameName ? new Manager(gameName) : null),
    [gameName],
  );

  const playTestCode = React.useCallback(
    (state: string) => {
      setError(null);
      manager?.play(state);
    },
    [manager],
  );

  const enterCharacter = React.useCallback(
    (char: string) => {
      if (shouldClear) {
        dispatch({ type: "clear" });
        setShouldClear(false);
      }
      dispatch({ type: "input", value: char });
    },
    [shouldClear],
  );

  const clear = React.useCallback(() => {
    dispatch({ type: "clear" });
  }, []);

  const startGame = React.useCallback(() => {
    setError(null);
    setResult(null);
    setTimeElapsed(0);
    setShowModal(false);
    setShowModalDialog(false);
    setShouldClear(false);
    dispatch({ type: "clear" });
    setGameName(generateName());
    setStarted(true);
    setCountdownActive(true);
    navigate("/game");
  }, [navigate]);

  const handleCountdownComplete = React.useCallback(() => {
    setCountdownActive(false);
    manager?.resumeTimer();
  }, [manager]);

  const continueGame = React.useCallback(() => {
    if (!manager) return;
    setStarted(true);
    navigate("/game");
  }, [manager, navigate]);

  const playMultiplayer = React.useCallback(() => {
    window.alert("Multiplayer is coming soon.");
  }, []);

  const openHighScores = React.useCallback(() => {
    navigate("/high-scores");
  }, [navigate]);

  const navigateBack = React.useCallback(() => {
    navigate("/");
  }, [navigate]);

  React.useEffect(() => {
    onAuthStateChanged(getAuth(), (user) => {
      if (user) {
        setCurrentUser(user.uid);
      } else {
        fetch(
          "https://us-central1-one-dead.cloudfunctions.net/generateUserToken",
        )
          .then((res) => res.text())
          .then(async (token) => {
            const { user } = await signInWithCustomToken(getAuth(), token);
            setCurrentUser(user.uid);
          })
          .catch((err) => {
            console.error("Error signing in with custom token:", err);
          });
      }
    });
  }, []);

  React.useEffect(() => {
    if (!manager) return;

    const unSubTrial = manager.addTrialListener((result) => {
      setResult(result);
      setShouldClear(true);
    });

    const unSubPageVisibility = pageVisibility.addVisibilityChangeListener(
      (state) => {
        if (state == "hidden") {
          manager.pauseTimer();
        } else {
          manager.resumeTimer();
        }
      },
    );

    const unSubTimerState = manager.addTimerStateListener((state) => {
      setTimerState(state);
    });

    const unSubTimer = manager.addTimerListener((duration) => {
      setTimeElapsed(duration);
    });

    const unSubError = manager.addErrorListener((error) => {
      setError(error);
      setShouldClear(true);
    });

    const unSubComplete = manager.addCompleteListener(async (history) => {
      try {
        await sessionRepository.sessions.add(history);
      } catch (err) {
        console.error("Failed to add completed session to repository:", err);
      }
      setShowModal(true);
    });

    return () => {
      unSubError();
      unSubTimer();
      unSubTrial();
      unSubComplete();
      unSubTimerState();
      unSubPageVisibility();
    };
  }, [manager, pageVisibility]);

  React.useEffect(() => {
    if (manager && countdownActive) {
      manager.pauseTimer();
    }
  }, [manager, countdownActive]);

  React.useEffect(() => {
    const isHome = location.pathname === "/";
    const isHistory = location.pathname === "/game/history";
    const isHighScores = location.pathname === "/high-scores";

    if (isHighScores) {
      return;
    }

    if (isHome) {
      const l = (e: KeyboardEvent) => {
        if (e.key === "Enter") {
          startGame();
        }
      };

      document.addEventListener("keydown", l);

      return () => {
        document.removeEventListener("keydown", l);
      };
    }

    if (!manager) {
      const l = (e: KeyboardEvent) => {
        if (countdownActive) return;
        const val = e.key;

        const isEnter = val == "Enter";

        if (isEnter) {
          startGame();
        }
      };

      document.addEventListener("keydown", l);

      return () => {
        document.removeEventListener("keydown", l);
      };
    }

    const l = (e: KeyboardEvent) => {
      if (countdownActive) return;
      const val = e.key;

      const isEnter = val == "Enter";
      const isNumber = !Number.isNaN(Number.parseInt(val, 10));
      const isBackSpace = val == "Backspace";
      const isHistoryKey = val == "h" || val == "H";

      if (isEnter) {
        playTestCode(state);
      } else if (isBackSpace) {
        clear();
      } else if (isHistoryKey) {
        if (isHistory) {
          navigate("/game");
        } else {
          navigate("/game/history");
        }
      } else if (isNumber) {
        enterCharacter(val);
      }
    };

    document.addEventListener("keydown", l);

    return () => {
      document.removeEventListener("keydown", l);
    };
  }, [
    clear,
    enterCharacter,
    manager,
    playTestCode,
    location.pathname,
    navigate,
    startGame,
    state,
    countdownActive,
  ]);

  React.useEffect(() => {
    try {
      // biome-ignore lint/suspicious/noAssignInExpressions: Need for google ads
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error(err);
    }
  }, []);

  const outletContext: AppOutletContext = {
    startGame,
    openHighScores,
    continueGame,
    canContinue: Boolean(manager),
    playMultiplayer,
    navigateBack,
    manager,
    error,
    state,
    result,
    clear,
    enterCharacter,
    playTestCode,
    // Game layout state
    started,
    setStarted,
    countdownActive,
    handleCountdownComplete,
    showModal,
    showModalDialog,
    setShowModalDialog,
    timerState,
    timeElapsed,
    replayGame: () => {
      AppAnalytics.replayGame();
      navigate("/", { replace: true });
    },
    shareApp: () => {
      if (navigator.share) {
        navigator.share({
          title: "One dead game",
          url: "https://one-dead.web.app",
          text: "A strategic guessing game",
        });
      }
      AppAnalytics.share();
    },
  };

  return <Outlet context={outletContext} />;
};

export default AppContent;
