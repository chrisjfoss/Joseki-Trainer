import type { DatabaseTypes } from '@/database';
import type { Vertex } from '@sabaki/go-board';

export const isTenuki = (move: DatabaseTypes.Move | Vertex | null) => {
  if (!move) return false;
  if (move instanceof Array) {
    return move[0] === -1 && move[1] === -1;
  }
  return move.point.x === -1 && move.point.y === -1;
};
