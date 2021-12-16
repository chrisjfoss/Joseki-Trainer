import { Player, Position } from "@/db/types";
import { getAppliedTransformation, Matrix } from "@/utils";
import { getVerticeTransformation } from "@/utils/matrixUtil";
import GoBoard, { Vertex } from "@sabaki/go-board";
import type { IndexableType } from "dexie";
import { db } from "../db";
import {
  getOriginalPositionFromBoard,
  getPositionFromBoard,
  savePosition
} from "./position";

export const getAllMoves = async () => {
  return db.moves.toArray();
};

export const getMovesByPositionId = async (positionId: IndexableType) => {
  // Get all moves for the position
  return await db.moves
    .where("previousPositionId")
    .equals(positionId)
    .toArray();
};

export const saveMove = async (
  vertex: Vertex,
  board: GoBoard,
  player: Player,
  previousBoard: GoBoard
) => {
  // CURRENT POSITION - after move //
  const dbPosition = await getPositionFromBoard(board, player);
  const positionId: IndexableType | undefined =
    dbPosition?.id ?? (await savePosition(board, player));

  // PREVIOUS POSITION - prior to move //
  const previousDbPosition: Position | undefined = previousBoard
    ? await getOriginalPositionFromBoard(previousBoard, (player * -1) as Player)
    : undefined;
  const previousPositionId: IndexableType =
    previousDbPosition?.id ??
    (await savePosition(previousBoard, (player * -1) as Player));

  const previousTransformation = previousDbPosition
    ? getAppliedTransformation(previousDbPosition.position, previousBoard)
    : Matrix.Transformation.original;

  // Create move if doesn't exist
  const transformedMove = getVerticeTransformation(
    vertex,
    previousTransformation,
    board.width,
    board.height
  );

  const dbMove = await db.moves
    .where("previousPositionId")
    .equals(previousPositionId as IndexableType)
    .and((move) => move.positionId === positionId)
    .first();

  const moveId =
    dbMove?.id ??
    (await addMove(
      transformedMove,
      positionId as IndexableType,
      previousPositionId
    ));

  return {
    positionId,
    moveId
  };
};

const addMove = async (
  point: Vertex,
  positionId: IndexableType,
  previousPositionId?: IndexableType
) => {
  return await db.moves.add({
    point: {
      x: point[0],
      y: point[1]
    },
    positionId,
    previousPositionId: previousPositionId ?? 0,
    comments: ""
  });
};
