import React from "react";

import Button from "./Button";
import { formatResult } from "../utils";
import type { AppState, Result } from "@/game/types";

interface GameProps {
  state: AppState;
  clear: () => void;
  error: Error | null;
  result: Result | null;
  enterCharacter: (char: string) => void;
  playTestCode: (state: AppState) => void;
}

const Game = ({
  error,
  state,
  result,
  clear,
  playTestCode,
  enterCharacter,
}: GameProps): React.ReactElement => {
  return (
    <div id="game" className="flex flex-col grow gap-4">
      <div className="m-1 rounded-xl h-1/3 border-2 border-gray-200 flex flex-col justify-center items-center relative overflow-hidden select-none">
        <div className="flex flex-col bg-linear-to-b from-white via-95% via-gray-200 to-gray-200 justify-center items-center w-full h-full relative z-10 gap-3 p-4">
          <div className="text-7xl sm:text-7xl lcd-display-text select-none">
            {state}
          </div>
          <div className="h-6 flex items-center justify-center">
            {error ? (
              <div className="lcd-subtext-error">
                {String(error.message || error)}
              </div>
            ) : result ? (
              <div className="lcd-subtext">{formatResult(result)}</div>
            ) : (
              <div className="lcd-subtext text-slate-400 uppercase text-xs tracking-widest font-semibold select-none">
                Ready for code
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="h-2/3 grid grid-cols-3 gap-4">
        <Button onClick={() => enterCharacter("1")}>1</Button>
        <Button onClick={() => enterCharacter("2")}>2</Button>
        <Button onClick={() => enterCharacter("3")}>3</Button>
        <Button onClick={() => enterCharacter("4")}>4</Button>
        <Button onClick={() => enterCharacter("5")}>5</Button>
        <Button onClick={() => enterCharacter("6")}>6</Button>
        <Button onClick={() => enterCharacter("7")}>7</Button>
        <Button onClick={() => enterCharacter("8")}>8</Button>
        <Button onClick={() => enterCharacter("9")}>9</Button>
        <Button onClick={() => clear()}>Clear</Button>
        <Button onClick={() => enterCharacter("0")}>0</Button>
        <Button onClick={() => playTestCode(state)}>Enter</Button>
      </div>
    </div>
  );
};

export default Game;
