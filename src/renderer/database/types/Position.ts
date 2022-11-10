import type { Player, Move } from ".";

export interface Position {
  id?: number;
  boardDimensionId: number;
  position: string;
  tag: string;
  ko: {
    x: number;
    y: number;
  };
  player: Player;
  comments: string;
  evaluation: string;
  candidateMoves: Move[];
}
