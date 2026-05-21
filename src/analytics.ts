import { logEvent } from "firebase/analytics";

import { analytics } from "./firebase";

class AppAnalytics {
  public static startedGame(gameId: string, mainCode: string) {
    const event = "started_game";

    if (!analytics) return;

    logEvent(analytics, event, {
      gameId,
      mainCode,
      startTime: Date.now(),
    });
  }

  public static share() {
    if (!analytics) return;

    logEvent(analytics, "share");
  }

  public static replayGame() {
    if (!analytics) return;

    logEvent(analytics, "replay_game");
  }

  public static winGame(gameId: string, mainCode: string, numOfTrials: string) {
    const event = "started_game";

    if (!analytics) return;

    logEvent(analytics, event, {
      gameId,
      mainCode,
      numOfTrials,
      endTime: Date.now(),
    });
  }

}

export default AppAnalytics;
