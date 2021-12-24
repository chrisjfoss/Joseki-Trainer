import { Training } from "@/constants";
import { Player, Position } from "@/db/types";
import { getAppliedTransformation, Leitner, Matrix } from "@/utils";
import { getCurrentSession } from "@/utils/leitner";
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

export const getMoveCountBySessionDate = async () => {
  const moves = await db.moves.toArray();
  const movesBySessionDate = new Map<number, number>();
  moves.forEach(move => {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const currentTimestamp = today.getTime();

    if (move.nextSessionTimestamp <= currentTimestamp) {
      const currentCount = movesBySessionDate.get(currentTimestamp) ?? 0;
      movesBySessionDate.set(
        currentTimestamp,
        currentCount + 1
      );
    }
    else {
      const currentCount = movesBySessionDate.get(move.nextSessionTimestamp) ?? 0
      movesBySessionDate.set(
        move.nextSessionTimestamp,
        currentCount + 1
      );
    }
  })
  return movesBySessionDate;
}

export const getMovesForCurrentSession = async () => {
  return await db.moves
    .where("deck")
    .equals(10)
    .or("deck")
    .equals(getCurrentSession())
    .filter(move => {
      const filterDate = new Date();
      filterDate.setUTCHours(0, 0, 0, 0);
      return move.deck === 10 || move.nextSessionTimestamp <= filterDate.getTime();
    })
    .toArray();
};

export const getMovesByPositionId = async (positionId: IndexableType) => {
  // Get all moves for the position
  return await db.moves
    .where("previousPositionId")
    .equals(positionId)
    .toArray();
};

export const trainedMove = async (
  moveId: number,
  result: Training.Result,
) => {
  if (result === Training.Result.alternate) {
    return;
  }
  const move = await db.moves.get(moveId);
  if (!move) {
    throw new Error(`Move with id ${moveId} not found`);
  }
  const currentDeck = move.deck;
  const success = result === Training.Result.solved;
  move.deck = Leitner.getNewDeck(success, currentDeck);
  move.nextSessionTimestamp = Leitner.getNextDateForDeck(move.deck).getTime();
  move.numberOfAttempts += 1;
  if (success) move.numberOfSuccesses += 1;
  await db.moves.put(move);
}

export const updateMoveComment = async (
  moveId: number,
  comment: string,
) => {
  const move = await db.moves.get(moveId);
  if (!move) {
    throw new Error(`Move with id ${moveId} not found`);
  }
  move.comments = comment;
  await db.moves.put(move);
}

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
  const nextSessionDate = new Date();
  nextSessionDate.setUTCHours(0, 0, 0, 0);
  return await db.moves.add({
    point: {
      x: point[0],
      y: point[1]
    },
    positionId,
    previousPositionId: previousPositionId ?? 0,
    comments: "",

    // 10 is the "Current deck"
    deck: 10,
    nextSessionTimestamp: nextSessionDate.getTime(),

    numberOfAttempts: 0,
    numberOfSuccesses: 0
  });
};
