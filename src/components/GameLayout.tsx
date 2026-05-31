import React from "react";
import {
  Outlet,
  useOutletContext,
  useNavigate,
  useLocation,
} from "react-router";

import Countdown from "./Countdown";
import Modal from "./completeModal";
import MyModal from "./modalDialog";
import StartModal from "./startModal";
import type { AppOutletContext } from "../router";

/**
 * GameLayout renders the full /game/* shell:
 *   - Ad banners on each side (desktop only)
 *   - Header bar with menu button, trial counter, timer, and history toggle
 *   - Modals (start, complete, settings)
 *   - <Outlet /> for the /game (index) and /game/history child routes
 */
const GameLayout = (): React.ReactElement => {
  const ctx = useOutletContext<AppOutletContext>();
  const navigate = useNavigate();
  const location = useLocation();

  const numOfTrials = ctx.manager?.getGameHistory().trials.length;

  const computeTime = (duration: number) => {
    const seconds = (duration % 60).toString().padStart(2, "0");
    const minutes = (Math.floor(duration / 60) % 60)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

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
        ></ins>
      </div>
      <div className="relative flex bg-white flex-col h-screen pb-3 px-2 justify-center content-center border-gray-300 border-x-2 w-full sm:w-8/12 md:w-5/12">
        {ctx.countdownActive && (
          <Countdown onComplete={ctx.handleCountdownComplete} />
        )}
        <div className="flex justify-between items-center h-14 py-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => ctx.setShowModalDialog((value) => !value)}
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
              {computeTime(ctx.timeElapsed)}
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

        <StartModal show={!ctx.started} onClickClose={ctx.startGame} />
        <Modal
          elapsedTime={ctx.timeElapsed}
          show={ctx.showModal}
          onClickRetry={ctx.replayGame}
          onClickShare={ctx.shareApp}
        />

        {ctx.showModalDialog && (
          <MyModal
            isPaused={ctx.timerState}
            show={ctx.showModalDialog}
            onClickReset={ctx.replayGame}
            setShow={ctx.setShowModalDialog}
            onClickPause={() => ctx.manager!.toggleTimer()}
            onClickInstructions={() => ctx.setStarted((res) => !res)}
          />
        )}

        {/* Child route outlet: renders <Game /> or <History /> */}
        <Outlet context={ctx} />

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
  );
};

export default GameLayout;
