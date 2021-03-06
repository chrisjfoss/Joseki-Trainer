import { Vertex } from "@/components/GoBoard/ShudanPort/types";
import Board from "@sabaki/go-board";

export type MoveList = Array<Move>;

export type Move = {
    board: Board;
    priorMove: Vertex | null;
    player: 1 | -1;
}