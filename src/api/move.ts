import { Training } from "@/constants";
import { Move, Player, Position } from "@/db/types";
import { getAppliedTransformation, Leitner, Matrix } from "@/utils";
import { getVerticeTransformation } from "@/utils/matrixUtil";
import GoBoard, { Vertex } from "@sabaki/go-board";
import type { IndexableType } from "dexie";
import { DatabaseApi, PositionApi } from ".";
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
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const endOfDay = today.getTime();
  today.setHours(0, 0, 0, 0);
  const startOfDay = today.getTime();

  moves.forEach((move) => {
    if (move.nextSessionTimestamp <= endOfDay) {
      const currentCount = movesBySessionDate.get(startOfDay) ?? 0;
      movesBySessionDate.set(startOfDay, currentCount + 1);
    } else {
      const nextSession = new Date(move.nextSessionTimestamp);
      nextSession.setHours(0, 0, 0, 0);
      const currentCount = movesBySessionDate.get(nextSession.getTime()) ?? 0;
      movesBySessionDate.set(nextSession.getTime(), currentCount + 1);
    }
  });
  return movesBySessionDate;
};

export const getMovesForCurrentSession = async () => {
  const playerFocus = await DatabaseApi.getCurrentRepositoryPlayer();
  const moves = await db.moves
    .filter((move) => {
      const endOfDay = new Date();
      endOfDay.setHours(24, 0, 0, 0);
      return (
        move.deck === 10 || move.nextSessionTimestamp <= endOfDay.getTime()
      );
    })
    .toArray();
  const toReturn = [] as Move[];
  for (const move of moves) {
    const position = await PositionApi.getPositionById(move.positionId);
    if (position?.player == playerFocus || playerFocus == 0) {
      toReturn.push(move);
    }
  }
  return toReturn;
};

export const getMovesByPositionId = async (positionId: IndexableType) => {
  // Get all moves for the position
  return await db.moves
    .where("previousPositionId")
    .equals(positionId)
    .toArray();
};

export const trainedMove = async (moveId: number, result: Training.Result) => {
  if (result === Training.Result.alternate) {
    return;
  }
  const move = await db.moves.get(moveId);
  if (!move) {
    throw new Error(`Move with id ${moveId} not found`);
  }
  const currentDeck = move.deck;
  const success = result === Training.Result.solved;
  move.deck = Leitner.getNewDeck(
    success,
    currentDeck,
    move.nextSessionTimestamp
  );
  move.nextSessionTimestamp = Leitner.getNextDateForDeck(move.deck).getTime();
  move.numberOfAttempts += 1;
  if (success) move.numberOfSuccesses += 1;
  await db.moves.put(move);
};

export const updateMoveComment = async (moveId: number, comment: string) => {
  const move = await db.moves.get(moveId);
  if (!move) {
    throw new Error(`Move with id ${moveId} not found`);
  }
  move.comments = comment;
  await db.moves.put(move);
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
  const nextSessionDate = new Date();
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
