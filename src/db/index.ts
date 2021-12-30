import Dexie, { Table } from "dexie";
import type { Move, Position, Repository } from "./types";
import { BoardDimension } from "./types/BoardDimension";

export class RepositoryDatabase extends Dexie {
  boardDimensions!: Table<BoardDimension>;
  positions!: Table<Position>;
  moves!: Table<Move>;

  constructor(name = "default") {
    super(name);
    this.version(1).stores({
      boardDimensions: "++id, [rows+columns]",
      positions: "++id, position, boardDimensionId, ko", // Primary key and indexed props
      moves:
        "++id, point, positionId, previousPositionId, deck, nextSessionTimestamp"
    });
  }
}

export class RepositoryManagerDatabase extends Dexie {
  repositories!: Table<Repository>;
  constructor() {
    super("RepositoryManager");
    this.version(1).stores({
      repositories: "++id, name"
    });
  }
}

let _db = new RepositoryDatabase();

export const switchRepository = (name: string) => {
  _db = new RepositoryDatabase(name);
};

export { _db as db };
export const repositoryDb = new RepositoryManagerDatabase();
