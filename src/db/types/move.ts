import { IndexableType } from "dexie";

export interface Move {
  id?: number;
  // The point always matches the transform of the previous position id
  point: {
    x: number;
    y: number;
  };
  positionId: IndexableType;
  previousPositionId: IndexableType;
  comments: string;

  deck: number;
  nextSessionTimestamp: number;

  numberOfAttempts: number;
  numberOfSuccesses: number;
}
