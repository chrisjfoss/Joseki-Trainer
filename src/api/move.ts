import { Training } from "@/constants";
import { Move, Player, Position } from "@/db/types";
import { getAppliedTransformation, Leitner, Matrix } from "@/utils";
import { getVerticeTransformation } from "@/utils/matrixUtil";
import GoBoard, { Vertex } from "@sabaki/go-board";
import type { IndexableType } from "dexie";
import { DatabaseApi, PositionApi } from ".";
import {
  getOriginalPositionFromBoard,
  getPositionFromBoard,
  savePosition
} from "./position";

export const getAllMoves = async (name?: string) => {
  const db = await DatabaseApi.getDatabaseRepository(name);
  return db.moves.toArray();
};

export const getAllMoveCountsBySessionDate = async () => {
  const dbNames = await DatabaseApi.getAvailableDatabases();
  const dbInformation: { database: string; moveCounts: [number, number][] }[] =
    [];
  for (const dbName of dbNames) {
    const moveCounts = await getMoveCountBySessionDate(dbName);
    dbInformation.push({ database: dbName, moveCounts });
  }
  return dbInformation;
};

export const getMoveCountBySessionDate = async (name?: string) => {
  const db = await DatabaseApi.getDatabaseRepository(name);
  const playerFocus = await DatabaseApi.getRepositoryPlayer(name);
  const moves = await db.moves.toArray();
  const movesBySessionDate = new Map<number, number>();
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const endOfDay = today.getTime();
  today.setHours(0, 0, 0, 0);
  const startOfDay = today.getTime();

  await Promise.all(
    moves.map(async (move) => {
      if (playerFocus !== 0) {
        const position = await PositionApi.getPositionById(
          move.positionId,
          false,
          name
        );
        if (position?.player !== playerFocus) {
          return;
        }
      }
      if (move.nextSessionTimestamp <= endOfDay) {
        const currentCount = movesBySessionDate.get(startOfDay) ?? 0;
        movesBySessionDate.set(startOfDay, currentCount + 1);
      } else {
        const nextSession = new Date(move.nextSessionTimestamp);
        nextSession.setHours(0, 0, 0, 0);
        const currentCount = movesBySessionDate.get(nextSession.getTime()) ?? 0;
        movesBySessionDate.set(nextSession.getTime(), currentCount + 1);
      }
    })
  );
  const sortedMoves = Array.from(movesBySessionDate.entries()).sort((a, b) => {
    return a[0] > b[0] ? 1 : -1;
  });
  return sortedMoves;
};

export const getMovesForCurrentSession = async (dbName?: string) => {
  const db = await DatabaseApi.getDatabaseRepository(dbName);
  const playerFocus = await DatabaseApi.getRepositoryPlayer(dbName);
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

export const getMovesByPositionId = async (
  positionId: IndexableType,
  dbName?: string
) => {
  const db = await DatabaseApi.getDatabaseRepository(dbName);
  // Get all moves for the position
  return await db.moves
    .where("previousPositionId")
    .equals(positionId)
    .toArray();
};

export const removeLine = async (moveId: IndexableType) => {
  const db = await DatabaseApi.getDatabaseRepository();
  const move = await db.moves.get(moveId);
  if (!move?.positionId) return;
  // const position = getPositionById(move.positionId);

  const movesToReachPosition = await getMovesToReachPositionId(move.positionId);

  if (movesToReachPosition.length === 1) {
    const positionMoves = await getMovesByPositionId(move.positionId);
    // Remove position
    await db.positions.delete(move.positionId);
    positionMoves.forEach((positionMove) => {
      if (positionMove.id) {
        removeLine(positionMove.id);
      }
    });
  }
  // Remove move
  await removeMove(moveId);
};

export const removeMove = async (moveId: IndexableType) => {
  const db = await DatabaseApi.getDatabaseRepository();
  return db.moves.delete(moveId);
};

export const getMoveByPrevAndCurrentPositionId = async (
  prevPositionId: IndexableType,
  currentPositionId: IndexableType
) => {
  const db = await DatabaseApi.getDatabaseRepository();
  return await db.moves
    .where("previousPositionId")
    .equals(prevPositionId)
    .and((move) => move.positionId === currentPositionId)
    .first();
};

export const getMovesToReachPositionId = async (positionId: IndexableType) => {
  const db = await DatabaseApi.getDatabaseRepository();
  // Get all moves for the position
  return await db.moves.where("positionId").equals(positionId).toArray();
};

export const trainedMove = async (moveId: number, result: Training.Result) => {
  const db = await DatabaseApi.getDatabaseRepository();
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
  const db = await DatabaseApi.getDatabaseRepository();
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
  const db = await DatabaseApi.getDatabaseRepository();
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
  const db = await DatabaseApi.getDatabaseRepository();
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
