import Dexie, { type Table } from "dexie";

import type { IHistory } from "@/game/types";

class SessionRepository extends Dexie {
  sessions: Table<IHistory, number>;

  constructor() {
    super("sessions");
    this.version(1).stores({
      sessions: "name, mainCode, startTime",
    });
    this.sessions = this.table("sessions");
  }
}

export const sessionRepository = new SessionRepository();
