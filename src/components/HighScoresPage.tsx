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
    <div className="flex h-dvh w-screen items-center justify-center bg-gray-100">
      <main className="relative flex h-screen w-full flex-col overflow-hidden border-x-2 border-gray-300 bg-white sm:w-8/12 md:w-5/12">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-gray-200 px-6 py-4">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center justify-center rounded-lg p-1.5 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
            aria-label="Back"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5 8.25 12l7.5-7.5"
              />
            </svg>
          </button>
          <h1 className="text-lg font-bold text-gray-900">High Scores</h1>
        </div>

        {/* Content */}
        <div
          id="high-scores"
          className="flex flex-col grow gap-4 p-6 overflow-y-auto"
        >
          {loading ? (
            <div className="flex flex-1 items-center justify-center text-sm text-gray-400">
              Loading…
            </div>
          ) : scores.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
              <span className="text-4xl">🏆</span>
              <p className="text-sm font-medium text-gray-500">
                No completed games yet.
              </p>
              <p className="text-xs text-gray-400">Go set a record!</p>
            </div>
          ) : (
            <table className="table-auto w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="pb-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-400 w-10">
                    #
                  </th>
                  <th className="pb-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Name
                  </th>
                  <th className="pb-2 text-center text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Tries
                  </th>
                  <th className="pb-2 text-right text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody>
                {scores.map((score, index) => (
                  <tr
                    key={`${score.name}-${score.startTime}`}
                    className="border-b border-gray-50 text-sm transition hover:bg-gray-50"
                  >
                    <td className="py-3 pr-2 text-left font-bold text-gray-400">
                      {RANK_LABELS[index] ?? index + 1}
                    </td>
                    <td className="py-3 text-left font-semibold text-gray-900 truncate max-w-[140px]">
                      {score.name}
                    </td>
                    <td className="py-3 text-center text-gray-600">
                      {score.trials.length}
                    </td>
                    <td className="py-3 text-right font-mono font-bold text-gray-900">
                      {formatTime(getCompletionTime(score))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
};

export default HighScoresPage;
