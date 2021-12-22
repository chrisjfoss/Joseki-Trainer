import { BoardApi } from "@/api";
import { Vertex } from "@/components/GoBoard/ShudanPort/types";
import { Position } from "@/db/types";
import GoBoard, { Sign, SignMap } from "@sabaki/go-board";

interface GoBoardWithKo extends GoBoard {
  _koInfo: { sign: Sign; vertex: Vertex };
}

export const getBoardFromPosition = (
  position: Position,
  width: number,
  height: number
): GoBoard => {
  const board = GoBoard.fromDimensions(width, height);
  board.signMap = getSignMapFromPosition(position, width, height);
  (board as GoBoardWithKo)._koInfo = {
    sign: (position.player * -1) as Sign,
    vertex: [position.ko.x, position.ko.y] as Vertex
  };
  return board;
};

export const getSignMapFromPosition = (
  position: Position,
  width: number,
  height: number
): SignMap => {
  const signMap: SignMap = [];
  for (let i = 0; i < width; i++) {
    signMap.push([] as Sign[]);
    for (let j = 0; j < height; j++) {
      const sign = (Number.parseInt(position.position[i][j]) - 1) as Sign;
      signMap[i].push(sign);
    }
  }
  return signMap;
};
