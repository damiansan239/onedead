import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import React from "react";

import type { IHistory } from "@/game/types";
import { sessionRepository } from "@/repository";

interface HighScoresPageProps {
  onBack: () => void;
}

const getCompletionTime = (history: IHistory): number => {
  const lastTrial = history.trials.at(-1);
  return lastTrial?.timestamp ?? 0;
};

const formatTime = (duration: number): string => {
  const seconds = (duration % 60).toString().padStart(2, "0");
  const minutes = (Math.floor(duration / 60) % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
};

const RANK_LABELS: Record<number, string> = {
  0: "🥇",
  1: "🥈",
  2: "🥉",
};

const HighScoresPage = ({
  onBack,
}: HighScoresPageProps): React.ReactElement => {
  const [scores, setScores] = React.useState<IHistory[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let isMounted = true;

    sessionRepository.sessions
      .toArray()
      .then((sessions) => {
        if (!isMounted) return;

        const sorted = sessions
          .filter(
            (s) =>
              s.trials.length > 0 && s.trials.at(-1)?.result.deadCount === 4,
          )
          .sort((a, b) => {
            const diff = a.trials.length - b.trials.length;
            if (diff !== 0) return diff;
            return getCompletionTime(a) - getCompletionTime(b);
          })
          .slice(0, 10);

        setScores(sorted);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="flex h-dvh w-screen items-center justify-center">
      <main className="relative flex h-screen w-full flex-col overflow-hidden border-x-2 border-gray-300 sm:w-8/12 md:w-5/12">
        {/* Navigation Bar (iOS style) */}
        <div className="relative flex h-11 items-center justify-between border-b border-gray-200/80 px-2 backdrop-blur-md">
          {/* Back button */}
          <button
            type="button"
            onClick={onBack}
            className="space-x-1 flex items-center text-[#007aff] transition active:opacity-50 select-none"
            aria-label="Back"
          >
            <ChevronLeftIcon className="h-5 w-5 stroke-[2.5]" />
            <span className="text-[17px] -ml-1">Home</span>
          </button>

          {/* Title */}
          <span className="absolute left-1/2 -translate-x-1/2 text-[17px] font-semibold text-black">
            High Scores
          </span>

          {/* Right Spacer */}
          <div className="w-12" />
        </div>

        {/* Content */}
        <div id="high-scores" className="flex-1 overflow-y-auto pb-8">
          {loading ? (
            <div className="mt-8 mx-4 overflow-hidden rounded-xl bg-white p-8 text-center text-sm text-gray-400 shadow-xs">
              Loading…
            </div>
          ) : scores.length === 0 ? (
            <div className="mt-8 mx-4 overflow-hidden rounded-xl bg-white p-8 text-center shadow-xs">
              <span className="text-4xl block mb-2">🏆</span>
              <p className="text-sm font-medium text-gray-500">
                No completed games yet.
              </p>
              <p className="text-xs text-gray-400 mt-1">Go set a record!</p>
            </div>
          ) : (
            <div className="mt-8">
              <span className="px-4 text-[13px] font-normal uppercase tracking-wider text-gray-500">
                Leaderboard
              </span>
              <div className="mt-2 mx-4 overflow-hidden rounded-xl bg-white border-2 border-[#f2f2f7] shadow-xs">
                {scores.map((score, index) => (
                  <div key={`${score.name}-${score.startTime}`}>
                    <div className="flex items-center justify-between px-4 py-3 bg-white transition hover:bg-gray-50/50">
                      <div className="flex items-center">
                        {/* Rank Circle */}
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-150 text-sm font-bold text-gray-700">
                          {RANK_LABELS[index] ?? index + 1}
                        </div>
                        <span className="flex flex-col gap-0.5 ml-3 text-[17px] font-medium text-black truncate max-w-32.5 sm:max-w-42.5">
                          {score.name}
                          <br />
                          <span className="text-xs text-gray-500">
                            {score.mainCode}
                          </span>
                        </span>
                      </div>
                      <div className="flex flex-col items-end text-right">
                        <span className="text-sm text-gray-500">
                          {score.trials.length}{" "}
                          {score.trials.length === 1 ? "try" : "tries"}
                        </span>
                        <span className="text-[17px] font-mono font-bold">
                          {formatTime(getCompletionTime(score))}
                        </span>
                      </div>
                    </div>
                    {index < scores.length - 1 && (
                      <div className="h-px bg-gray-100 ml-14" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default HighScoresPage;
