import { type DatabaseTypes } from "@/database";
import { BoardUtil } from ".";

export const positionsAreEqualWithTransformation = (a: DatabaseTypes.Position, b: DatabaseTypes.Position, width: number, height: number) => {
  const boardA = BoardUtil.getBoardFromPosition(a, width, height);
  const boardB = BoardUtil.getBoardFromPosition(b, width, height);
  return BoardUtil.areEqualWithTransformation(boardA, boardB);
}