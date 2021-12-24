import Dexie, { Table } from "dexie";
import type { Move, Position } from "./types";
import { BoardDimension } from "./types/BoardDimension";

export class SubClassedDexie extends Dexie {
  boardDimensions!: Table<BoardDimension>;
  positions!: Table<Position>;
  moves!: Table<Move>;

  constructor() {
    super("localdb");
    this.version(1).stores({
      boardDimensions: "++id, [rows+columns]",
      positions: "++id, position, boardDimensionId, ko", // Primary key and indexed props
      moves: "++id, point, positionId, previousPositionId, deck, nextSessionTimestamp"
    });
  }
}

export const db = new SubClassedDexie();
