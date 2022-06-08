import { Position } from "@/db/types";
import { BoardUtil } from ".";

export const positionsAreEqualWithTransformation = (a: Position, b: Position, width: number, height: number) => {
  const boardA = BoardUtil.getBoardFromPosition(a, width, height);
  const boardB = BoardUtil.getBoardFromPosition(b, width, height);
  return BoardUtil.areEqualWithTransformation(boardA, boardB);
}