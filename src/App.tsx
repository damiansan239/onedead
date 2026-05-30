/* eslint-disable @typescript-eslint/no-explicit-any */

import React from "react";

import {
  getAuth,
  signInWithCustomToken,
  onAuthStateChanged,
} from "firebase/auth";

import { customAlphabet } from "nanoid/non-secure";

import Game from "./components/Game";
import Manager from "@/game/manager";
import AppAnalytics from "./analytics";
import History from "./components/History";
import Modal from "./components/completeModal";
import MyModal from "./components/modalDialog";
import { sessionRepository } from "./repository";
import StartModal from "./components/startModal";
import HomeScreen from "./components/HomeScreen";
import HighScoresPage from "./components/HighScoresPage";
import Countdown from "./components/Countdown";
import { AppAction, AppState, Result } from "@/game/types";
import PageVisibilityService from "./services/pageVisibility";
import startupSoundService from "./services/startupSound";

import {
  createMemoryRouter,
  RouterProvider,
  Routes,
  Route,
  useNavigate,
  useLocation,
  useBlocker,
} from "react-router";

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

    const unSubComplete = manager.addCompleteListener((history) => {
      sessionRepository.sessions.add(history);
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
    const isHighScores = location.pathname === "/high-scores";
    const isHistory = location.pathname === "/game/history";

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

  const shareApp = () => {
    if (navigator["share"]) {
      navigator.share({
        title: "One dead game",
        text: "A strategic guessing game",
        url: "https://one-dead.web.app",
      });
    }
    AppAnalytics.share();
  };

  const computeTime = (duration: number) => {
    const seconds = (duration % 60).toString().padStart(2, "0");
    const minutes = (Math.floor(duration / 60) % 60)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  const numOfTrials = manager?.getGameHistory().trials.length;

  const replayGame = () => {
    AppAnalytics.replayGame();
    window.location.reload();
  };

  React.useEffect(() => {
    try {
      // biome-ignore lint/suspicious/noAssignInExpressions: Need for google ads
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error(err);
    }
  }, []);

  return (
    <Routes>
      <Route
        path="/"
        element={
          <HomeScreen
            onStartNewGame={startGame}
            onHighScores={openHighScores}
            onContinueGame={continueGame}
            canContinue={Boolean(manager)}
            onPlayMultiplayer={playMultiplayer}
          />
        }
      />
      <Route
        path="/high-scores"
        element={<HighScoresPage onBack={() => navigate("/")} />}
      />
      <Route
        path="/game/*"
        element={
          <div className="flex bg-gray-100 justify-center items-center w-screen h-screen">
            <div className="hidden md:block h-screen flex-1">
              <ins
                data-ad-format="auto"
                className="adsbygoogle"
                data-ad-slot="3571604024"
                style={{ display: "block" }}
                data-full-width-responsive="true"
                data-ad-client="ca-pub-6676760040468778"
              ></ins>
            </div>
            <div className="relative flex bg-white flex-col h-screen pb-3 px-2 justify-center content-center border-gray-300 border-x-2 w-full sm:w-8/12 md:w-5/12">
              {countdownActive && (
                <Countdown onComplete={handleCountdownComplete} />
              )}
              <div className="flex justify-between items-center h-14 py-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowModalDialog((value) => !value)}
                    className="relative inline-flex items-center justify-center gap-1.5 rounded-lg border border-stone-300 bg-linear-to-b from-white to-stone-100 px-3 py-1.5 text-sm font-extrabold tracking-wide text-stone-800 shadow-[0_1px_0_#c8c4be,0_2px_4px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] transition-all duration-150 ease-out hover:from-stone-50 hover:to-stone-200 active:translate-y-px active:shadow-[0_0px_0_rgba(0,0,0,0.1),inset_0_1px_2px_rgba(0,0,0,0.12)] focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 select-none cursor-pointer"
                  >
                    <span className="text-stone-500 flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="2.5"
                        stroke="currentColor"
                        className="w-4 h-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                        />
                      </svg>
                    </span>
                    <span>One dead</span>
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <div className="inline-flex justify-center items-center py-1.5 px-3 rounded-lg border border-stone-300/80 bg-stone-50 font-mono font-extrabold text-stone-700 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06),0_1px_0_rgba(255,255,255,0.9)] select-none text-sm">
                    {numOfTrials || 0}
                  </div>
                  <div className="inline-flex justify-center items-center py-1.5 px-3 rounded-lg border border-stone-300/80 bg-stone-50 font-mono font-extrabold text-stone-700 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06),0_1px_0_rgba(255,255,255,0.9)] select-none text-sm">
                    {computeTime(timeElapsed)}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (location.pathname === "/game/history") {
                        navigate("/game");
                      } else {
                        navigate("/game/history");
                      }
                    }}
                    className="relative inline-flex items-center justify-center rounded-lg border border-stone-300 bg-linear-to-b from-white to-stone-100 px-3 py-1.5 text-sm font-extrabold tracking-wide text-stone-800 shadow-[0_1px_0_#c8c4be,0_2px_4px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] transition-all duration-150 ease-out hover:from-stone-50 hover:to-stone-200 active:translate-y-px active:shadow-[0_0px_0_rgba(0,0,0,0.1),inset_0_1px_2px_rgba(0,0,0,0.12)] focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 select-none cursor-pointer"
                  >
                    History
                  </button>
                </div>
              </div>

              <StartModal show={!started} onClickClose={startGame} />
              <Modal
                elapsedTime={timeElapsed}
                show={showModal}
                onClickRetry={replayGame}
                onClickShare={shareApp}
              />

              {showModalDialog && (
                <MyModal
                  isPaused={timerState}
                  show={showModalDialog}
                  onClickReset={replayGame}
                  setShow={setShowModalDialog}
                  onClickPause={() => manager!.toggleTimer()}
                  onClickInstructions={() => setStarted((res) => !res)}
                />
              )}

              <Routes>
                <Route
                  index
                  element={
                    <Game
                      error={error}
                      clear={clear}
                      state={state}
                      result={result}
                      playTestCode={playTestCode}
                      enterCharacter={enterCharacter}
                    />
                  }
                />
                <Route path="history" element={<History manager={manager} />} />
              </Routes>

              <ins
                data-ad-format="fluid"
                className="adsbygoogle"
                data-ad-slot="5362934512"
                style={{ display: "block" }}
                data-ad-layout-key="-fb+5w+4e-db+86"
                data-ad-client="ca-pub-6676760040468778"
              ></ins>
            </div>
            <div className="hidden md:block h-screen flex-1">
              <ins
                data-ad-format="auto"
                className="adsbygoogle"
                data-ad-slot="7887626708"
                style={{ display: "block" }}
                data-full-width-responsive="true"
                data-ad-client="ca-pub-6676760040468778"
              ></ins>
            </div>
          </div>
        }
      />
    </Routes>
  );
};

const App = (): React.ReactElement => {
  const router = React.useMemo(
    () =>
      createMemoryRouter([
        {
          path: "*",
          element: <AppContent />,
        },
      ]),
    [],
  );

  return <RouterProvider router={router} />;
};

const generateName = (): string => {
  const alphabet =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const nanoid = customAlphabet(alphabet, 16);

  return nanoid();
};

const addValue = (input: string, value: string) => {
  if (input.length !== 1) {
    throw new Error("Input cannot be longer that one integer");
  }

  let numbers = "";
  for (const v of value) {
    if (v !== "_") {
      numbers = numbers.concat(v);
    } else {
      break;
    }
  }

  if (numbers.length !== 4) {
    numbers = numbers.concat(input);
  }

  let remainder = 4 - numbers.length;
  let spaces = remainder - 1;

  while (remainder != 0) {
    numbers = numbers.concat("_");
    if (spaces) {
      numbers = numbers.concat(" ");
      spaces--;
    }
    remainder--;
  }
  return numbers;
};

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export default App;
