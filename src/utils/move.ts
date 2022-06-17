import * as DbTypes from "@/db/types";
import { Vertex } from "@sabaki/go-board";

export const isTenuki = (move: DbTypes.Move | Vertex | null) => {
  if (!move) return false;
  if (move instanceof Array) {
    return move[0] === -1 && move[1] === -1;
  }
  return move.point.x === -1 && move.point.y === -1;
};
