/* eslint-disable @typescript-eslint/no-explicit-any */


import React from "react";

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
import { AppAction, AppState, Result } from "@/game/types";
import PageVisibilityService from "./services/pageVisibility";


const App = (): React.ReactElement => {
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

  //  const kShowHistory = getBoolean(config, "show_history");

  const [error, setError] = React.useState<Error | null>(null);
  const [started, setStarted] = React.useState<boolean>(false);
  const [state, dispatch] = React.useReducer(reducer, "_ _ _ _");
  const [timeElapsed, setTimeElapsed] = React.useState<number>(0);
  const [result, setResult] = React.useState<Result | null>(null);
  const [showModal, setShowModal] = React.useState<boolean>(false);
  const [timerState, setTimerState] = React.useState<boolean>(false);
  const [gameName, setGameName] = React.useState<string | null>(null);
  const [shouldClear, setShouldClear] = React.useState<boolean>(false);
  const [showHistory, setShowHistory] = React.useState<boolean>(false);
  const [showHome, setShowHome] = React.useState<boolean>(true);
  const [showHighScores, setShowHighScores] = React.useState<boolean>(false);
  const [showModalDialog, setShowModalDialog] = React.useState<boolean>(false);

  const pageVisibility = React.useMemo(() => new PageVisibilityService(), []);
  const manager = React.useMemo(() => gameName ? new Manager(gameName) : null, [gameName]);

  const playTestCode = React.useCallback((state: string) => {
    setError(null);
    manager?.play(state);
  }, [manager]);

  const enterCharacter = React.useCallback((char: string) => {
    if (shouldClear) {
      dispatch({ type: "clear" });
      setShouldClear(false);
    }
    dispatch({ type: "input", value: char });
  }, [shouldClear]);

  const clear = React.useCallback(() => {
    dispatch({ type: "clear" });
  }, []);

  const startGame = React.useCallback(() => {
    setError(null);
    setResult(null);
    setTimeElapsed(0);
    setShowHistory(false);
    setShowModal(false);
    setShowModalDialog(false);
    setShouldClear(false);
    dispatch({ type: "clear" });
    setGameName(generateName());
    setStarted(true);
    setShowHome(false);
    setShowHighScores(false);
  }, []);

  const continueGame = React.useCallback(() => {
    if (!manager) return;

    setStarted(true);
    setShowHome(false);
    setShowHighScores(false);
  }, [manager]);

  const playMultiplayer = React.useCallback(() => {
    window.alert("Multiplayer is coming soon.");
  }, []);

  const openHighScores = React.useCallback(() => {
    setShowHighScores(true);
    setShowHome(false);
  }, []);


  React.useEffect(() => {
    if (!manager) return;

    const unSubTrial = manager.addTrialListener((result) => {
      setResult(result);
      setShouldClear(true);
    });

    const unSubPageVisibility = pageVisibility.addVisibilityChangeListener((state) => {
      if (state == "hidden") {
        manager.pauseTimer();
      } else {
        manager.resumeTimer();
      }
    });

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
    if (showHome) {
      const l = (e: KeyboardEvent) => {
        if (e.key === "Enter" && !showHistory) {
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
      const val = e.key;

      const isEnter = val == "Enter";
      const isNumber = !Number.isNaN(Number.parseInt(val));
      const isBackSpace = val == "Backspace";
      const isHistory = val == "h" || val == "H";

      if (isEnter) {
        playTestCode(state);
      } else if (isBackSpace) {
        clear();
      } else if (isHistory) {
        setShowHistory(value => !value);
      } else if (isNumber) {
        enterCharacter(val);
      }
    };

    document.addEventListener("keydown", l);

    return () => {
      document.removeEventListener("keydown", l);
    };
  }, [clear, enterCharacter, manager, playTestCode, showHistory, showHome, startGame, state]);

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
    const minutes = (Math.floor(duration / 60) % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  const numOfTrials = manager?.getGameHistory().trials.length;

  const replayGame = () => {
    AppAnalytics.replayGame();
    window.location.reload();
  };

  React.useEffect(() => {
    try {
      ((window.adsbygoogle = window.adsbygoogle || []).push({}));
    } catch (err) {
      console.error(err);
    }
  }, []);

  if (showHighScores) {
    return (
      <HighScoresPage onBack={() => { setShowHighScores(false); setShowHome(true); }} />
    );
  }

  if (showHome) {
    return (
      <HomeScreen
        onStartNewGame={startGame}
        onHighScores={openHighScores}
        onContinueGame={continueGame}
        canContinue={Boolean(manager)}
        onPlayMultiplayer={playMultiplayer}
      />
    );
  }

  return (
    <div className="flex bg-gray-100 justify-center items-center w-screen h-screen">
      <div className="hidden md:block h-screen flex-1">
        <ins
          data-ad-format="auto"
          className="adsbygoogle"
          data-ad-slot="3571604024"
          style={{ display: "block" }}
          data-full-width-responsive="true"
          data-ad-client="ca-pub-6676760040468778"
        >
        </ins>
      </div>
      <div className="flex bg-white flex-col h-screen pb-3 px-2 justify-center content-center border-gray-300 border-x-2 w-full sm:w-8/12 md:w-5/12">
        <div className="flex justify-between items-center h-14 py-2">
          <button
            type="button"
            onClick={() => setShowModalDialog(value => !value)}
            className="relative inline-flex items-center justify-center gap-1.5 rounded-lg border border-stone-300 bg-linear-to-b from-white to-stone-100 px-3 py-1.5 text-sm font-extrabold tracking-wide text-stone-800 shadow-[0_1px_0_#c8c4be,0_2px_4px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] transition-all duration-150 ease-out hover:from-stone-50 hover:to-stone-200 active:translate-y-px active:shadow-[0_0px_0_rgba(0,0,0,0.1),inset_0_1px_2px_rgba(0,0,0,0.12)] focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 select-none cursor-pointer"
          >
            <span className="text-stone-500 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </span>
            <span>One dead</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="inline-flex justify-center items-center py-1.5 px-3 rounded-lg border border-stone-300/80 bg-stone-50 font-mono font-extrabold text-stone-700 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06),0_1px_0_rgba(255,255,255,0.9)] select-none text-sm">
              {numOfTrials || 0}
            </div>
            <div className="inline-flex justify-center items-center py-1.5 px-3 rounded-lg border border-stone-300/80 bg-stone-50 font-mono font-extrabold text-stone-700 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06),0_1px_0_rgba(255,255,255,0.9)] select-none text-sm">
              {computeTime(timeElapsed)}
            </div>

            <button
              type="button"
              onClick={() => setShowHistory(value => !value)}
              className="relative inline-flex items-center justify-center rounded-lg border border-stone-300 bg-linear-to-b from-white to-stone-100 px-3 py-1.5 text-sm font-extrabold tracking-wide text-stone-800 shadow-[0_1px_0_#c8c4be,0_2px_4px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] transition-all duration-150 ease-out hover:from-stone-50 hover:to-stone-200 active:translate-y-px active:shadow-[0_0px_0_rgba(0,0,0,0.1),inset_0_1px_2px_rgba(0,0,0,0.12)] focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 select-none cursor-pointer"
            >
              History
            </button>
          </div>
        </div>

        <StartModal show={!started} onClickClose={startGame} />
        <Modal elapsedTime={timeElapsed} show={showModal} onClickRetry={replayGame} onClickShare={shareApp} />

        {showModalDialog && <MyModal
          isPaused={timerState}
          show={showModalDialog}
          onClickReset={replayGame}
          setShow={setShowModalDialog}
          onClickPause={() => manager!.toggleTimer()}
          onClickInstructions={() => setStarted(res => !res)}
        />}

        {showHistory && (
          <History
            manager={manager}
          />
        )}

        {!showHistory && (
          <Game
            error={error}
            clear={clear}
            state={state}
            result={result}
            playTestCode={playTestCode}
            enterCharacter={enterCharacter}
          />
        )}
        <ins
          data-ad-format="fluid"
          className="adsbygoogle"
          data-ad-slot="5362934512"
          style={{ display: "block" }}
          data-ad-layout-key="-fb+5w+4e-db+86"
          data-ad-client="ca-pub-6676760040468778"
        >
        </ins>
        {/*
        <div className="block md:hidden h-[30vh]">
        </div>
*/}
      </div>
      <div className="hidden md:block h-screen flex-1">
        <ins
          data-ad-format="auto"
          className="adsbygoogle"
          data-ad-slot="7887626708"
          style={{ display: "block" }}
          data-full-width-responsive="true"
          data-ad-client="ca-pub-6676760040468778"
        >
        </ins>
      </div>
    </div>
  );
};



const generateName = (): string => {
  const alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
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
