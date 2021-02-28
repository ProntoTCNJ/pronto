import { Dexie } from "dexie";
import categories from "./categories";

interface ISessionEntry {
  hostname: string;
  timeStart: number;
  timeSpent: number;
}

interface IHostEntry {
  hostname: string;
  totalTimeSpent: number;
}

export class ProntoDB extends Dexie {
  sessions: Dexie.Table<ISessionEntry, string>;
  hosts: Dexie.Table<IHostEntry, string>;

  constructor() {
    super("tabs");
    this.version(1).stores({
      sessions: "++id, hostname, timeStart, timeSpent",
      hosts: "hostname, totalTimeSpent",
    });
    this.sessions = this.table("sessions");
    this.hosts = this.table("hosts");
  }

  getTopSpent() {
    return this.hosts
      .orderBy("totalTimeSpent")
      .reverse()
      .limit(20)
      .toArray();
  }

  async getTopSpentBetween(start: number, end: number) {
    const entries = await this.sessions
      .where("timeStart")
      .between(start, end)
      .sortBy("timeSpent");
    return entries.reduce<{
      [host: string]: number;
    }>((obj, entry) => {
      if (!obj[entry.hostname]) obj[entry.hostname] = 0;
      obj[entry.hostname] += entry.timeSpent;
      return obj;
    }, {});
  }

  getTopCategories() {}
}
