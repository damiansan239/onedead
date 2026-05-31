import React from "react";
import {
  QuestionMarkCircleIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
} from "@heroicons/react/24/outline";

import StartModal from "./startModal";
import startupSoundService from "../services/startupSound";

interface HomeScreenProps {
  canContinue: boolean;
  onContinueGame: () => void;
  onPlayMultiplayer: () => void;
  onStartNewGame: () => void;
  onHighScores: () => void;
}

interface DieProps {
  letter: string;
  rotation: string;
  isRed?: boolean;
}

const Die = ({
  letter,
  rotation,
  isRed = false,
}: DieProps): React.ReactElement => {
  return (
    <div
      className={`
        relative flex h-14 w-14 items-center justify-center rounded-xl text-2xl font-black uppercase select-none
        shadow-[0_6px_10px_rgba(0,0,0,0.15),inset_0_-4px_0_rgba(0,0,0,0.2),inset_0_2px_4px_rgba(255,255,255,0.6)]
        transition-all duration-300 ease-out hover:scale-110 hover:-translate-y-1.5 hover:rotate-0
        ${rotation}
        ${
          isRed
            ? "bg-linear-to-br from-red-500 to-rose-700 text-white border border-red-800 hover:shadow-[0_12px_20px_rgba(239,68,68,0.3),inset_0_-4px_0_rgba(0,0,0,0.2),inset_0_2px_4px_rgba(255,255,255,0.6)]"
            : "bg-linear-to-br from-white to-stone-200 text-stone-900 border border-stone-300 hover:shadow-[0_12px_20px_rgba(0,0,0,0.15),inset_0_-4px_0_rgba(0,0,0,0.2),inset_0_2px_4px_rgba(255,255,255,0.6)]"
        }
      `}
    >
      {/* 4 Corner Pips */}
      <span
        className={`absolute top-2.5 left-2.5 h-1.5 w-1.5 rounded-full ${isRed ? "bg-red-300/60" : "bg-stone-400"}`}
      />
      <span
        className={`absolute top-2.5 right-2.5 h-1.5 w-1.5 rounded-full ${isRed ? "bg-red-300/60" : "bg-stone-400"}`}
      />
      <span
        className={`absolute bottom-2.5 left-2.5 h-1.5 w-1.5 rounded-full ${isRed ? "bg-red-300/60" : "bg-stone-400"}`}
      />
      <span
        className={`absolute bottom-2.5 right-2.5 h-1.5 w-1.5 rounded-full ${isRed ? "bg-red-300/60" : "bg-stone-400"}`}
      />

      {/* The Letter */}
      <span className="relative z-10 font-serif tracking-tight">{letter}</span>
    </div>
  );
};

interface DiceButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: "default" | "primary";
}

/** A wide rectangular button that looks like a physical die face */
const DiceButton = ({
  onClick,
  children,
  variant = "default",
}: DiceButtonProps): React.ReactElement => {
  const isPrimary = variant === "primary";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        relative w-full select-none rounded-2xl px-6 py-4 text-center text-base font-bold tracking-wide
        transition-all duration-150 ease-out
        focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-2
        active:translate-y-0.75 active:shadow-[0_1px_0_rgba(0,0,0,0.15),inset_0_1px_3px_rgba(0,0,0,0.15)]
        ${
          isPrimary
            ? `bg-linear-to-b from-stone-900 to-stone-800 text-white border border-stone-950
             shadow-[0_5px_0_#111,0_8px_16px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.08)]
             hover:from-stone-800 hover:to-stone-700`
            : `bg-linear-to-b from-white to-stone-100 text-stone-800 border border-stone-300
             shadow-[0_5px_0_#c8c4be,0_8px_16px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)]
             hover:from-stone-50 hover:to-stone-200`
        }
      `}
    >
      {/* Corner pips — top-left */}
      <span className={`absolute top-2.5 left-3 flex gap-1`}>
        <span
          className={`h-1.5 w-1.5 rounded-full ${isPrimary ? "bg-white/20" : "bg-stone-400/40"}`}
        />
        <span
          className={`h-1.5 w-1.5 rounded-full ${isPrimary ? "bg-white/20" : "bg-stone-400/40"}`}
        />
      </span>
      {/* Corner pips — top-right */}
      <span className={`absolute top-2.5 right-3 flex gap-1`}>
        <span
          className={`h-1.5 w-1.5 rounded-full ${isPrimary ? "bg-white/20" : "bg-stone-400/40"}`}
        />
        <span
          className={`h-1.5 w-1.5 rounded-full ${isPrimary ? "bg-white/20" : "bg-stone-400/40"}`}
        />
      </span>
      {/* Corner pips — bottom-left */}
      <span className={`absolute bottom-2.5 left-3 flex gap-1`}>
        <span
          className={`h-1.5 w-1.5 rounded-full ${isPrimary ? "bg-white/20" : "bg-stone-400/40"}`}
        />
        <span
          className={`h-1.5 w-1.5 rounded-full ${isPrimary ? "bg-white/20" : "bg-stone-400/40"}`}
        />
      </span>
      {/* Corner pips — bottom-right */}
      <span className={`absolute bottom-2.5 right-3 flex gap-1`}>
        <span
          className={`h-1.5 w-1.5 rounded-full ${isPrimary ? "bg-white/20" : "bg-stone-400/40"}`}
        />
        <span
          className={`h-1.5 w-1.5 rounded-full ${isPrimary ? "bg-white/20" : "bg-stone-400/40"}`}
        />
      </span>

      {/* Label */}
      <span className="relative z-10">{children}</span>
    </button>
  );
};

const HomeScreen = ({
  canContinue,
  onContinueGame,
  onPlayMultiplayer,
  onStartNewGame,
  onHighScores,
}: HomeScreenProps): React.ReactElement => {
  const [showInstructions, setShowInstructions] =
    React.useState<boolean>(false);
  const [soundOn, setSoundOn] = React.useState<boolean>(
    () => startupSoundService.isSoundEnabled,
  );

  const handleToggleSound = React.useCallback(() => {
    setSoundOn((prev) => {
      const next = !prev;
      if (next) {
        startupSoundService.resume();
      } else {
        startupSoundService.pause();
      }
      return next;
    });
  }, []);

  const SoundIcon = soundOn ? SpeakerWaveIcon : SpeakerXMarkIcon;

  return (
    <div className="flex h-dvh w-screen items-center justify-center bg-gray-100">
      <main className="relative flex h-screen w-full flex-col justify-between overflow-hidden border-x-2 border-gray-300 bg-white px-6 py-8 sm:w-8/12 md:w-5/12">
        <div className="absolute right-5 top-5 z-10 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowInstructions(true)}
            aria-label="Instructions"
            title="Instructions"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200 bg-white/70 text-stone-500 shadow-xs transition hover:bg-white hover:text-stone-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-400"
          >
            <QuestionMarkCircleIcon className="h-5 w-5" aria-hidden="true" />
          </button>

          <button
            type="button"
            aria-pressed={soundOn}
            onClick={handleToggleSound}
            title={soundOn ? "Mute sound" : "Unmute sound"}
            aria-label={soundOn ? "Mute sound" : "Unmute sound"}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200 bg-white/70 text-stone-500 shadow-xs transition hover:bg-white hover:text-stone-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-400"
          >
            <SoundIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <section className="flex h-full w-full flex-col items-center justify-center gap-7 text-center">
          <div className="flex flex-col items-center gap-4">
            {/* "ONE" Row */}
            <div className="flex gap-3 justify-center">
              {[
                { letter: "O", rotation: "-rotate-[6deg]" },
                { letter: "N", rotation: "rotate-[3deg]" },
                { letter: "E", rotation: "-rotate-[4deg]" },
              ].map((die) => (
                <Die
                  key={die.letter}
                  letter={die.letter}
                  rotation={die.rotation}
                />
              ))}
            </div>

            {/* "DEAD" Row */}
            <div className="flex gap-3 justify-center">
              {[
                { letter: "D", rotation: "rotate-[5deg]" },
                { letter: "E", rotation: "-rotate-[3deg]" },
                { letter: "A", rotation: "rotate-[4deg]" },
                { letter: "D", rotation: "-rotate-[6deg]" },
              ].map((die, index) => (
                <Die
                  key={`${die.letter}-${index}`}
                  letter={die.letter}
                  rotation={die.rotation}
                  isRed
                />
              ))}
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-3 border-t border-gray-200 pt-6">
          <DiceButton onClick={onStartNewGame} variant="primary">
            New game
          </DiceButton>

          {canContinue && (
            <DiceButton onClick={onContinueGame}>Continue</DiceButton>
          )}

          <DiceButton onClick={onPlayMultiplayer}>Multiplayer</DiceButton>

          <DiceButton onClick={onPlayMultiplayer}>Tournament</DiceButton>

          <DiceButton onClick={onHighScores}>High scores</DiceButton>
        </section>

        <StartModal
          show={showInstructions}
          closeLabel="Close"
          onClickClose={() => setShowInstructions(false)}
        />
      </main>
    </div>
  );
};

export default HomeScreen;
