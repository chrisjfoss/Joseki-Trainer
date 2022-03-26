import { Player, Position } from "@/db/types";
import { getBoard, addBoard } from "./board";
import {
  getAllPositionStrings,
  getAppliedTransformation,
  getInverseTransformation
} from "@/utils";
import { getVerticeTransformation } from "@/utils/matrixUtil";
import type GoBoard from "@sabaki/go-board";
import { Sign, Vertex } from "@sabaki/go-board";
import { IndexableType } from "dexie";
import { DatabaseApi, MoveApi } from ".";

interface GoBoardWithKo extends GoBoard {
  _koInfo: { sign: Sign; vertex: Vertex };
}

export const getAllPositions = async (dbName?: string) => {
  const db = await DatabaseApi.getDatabaseRepository(dbName);
  return await db.positions.toArray();
};

export const getPositionById = async (
  id: IndexableType,
  includeCandidateMoves?: boolean,
  dbName?: string
) => {
  const db = await DatabaseApi.getDatabaseRepository(dbName);
  const position = await db.positions.get(id);
  if (position && includeCandidateMoves) {
    // Get all moves for the position
    position.candidateMoves = await MoveApi.getMovesByPositionId(
      position.id as IndexableType,
      dbName
    );
  }
  return position;
};

export const getOriginalPositionFromBoard = async (
  board: GoBoard,
  player: Player,
  dbName?: string
) => {
  const db = await DatabaseApi.getDatabaseRepository(dbName);
  return await db.transaction("r", db.positions, db.moves, async () => {
    // Get all position transformations
    const { original, ...positionStrings } = getAllPositionStrings(board);

    // Get all db positions that match any position transformations
    const returnValue = Object.keys(positionStrings).reduce((acc, current) => {
      return acc
        .or("position")
        .equals(positionStrings[current as keyof typeof positionStrings]);
    }, db.positions.where("position").equals(original));

    return returnValue
      .filter((position) => {
        const { ko, player: nextPlayer } = position as Position;
        const transformation = getAppliedTransformation(
          position.position,
          board
        );
        const boardKo = (board as GoBoardWithKo)._koInfo;
        const transformedBoardKo = getVerticeTransformation(
          boardKo.vertex,
          transformation,
          board.width,
          board.height
        );
        return (
          nextPlayer === player &&
          ko.x === transformedBoardKo[0] &&
          ko.y === transformedBoardKo[1]
        );
      })
      .first();
  });
};

export const getPositionFromBoard = async (
  board: GoBoard,
  player: Player,
  dbName?: string
) => {
  const dbPosition = await getOriginalPositionFromBoard(board, player, dbName);
  const transformations = getAllPositionStrings(board);

  if (dbPosition) {
    // Get all moves for the position
    dbPosition.candidateMoves = await MoveApi.getMovesByPositionId(
      dbPosition.id as IndexableType,
      dbName
    );

    // Transform results
    const transformedResult = dbPosition;
    const transformation = getInverseTransformation(
      getAppliedTransformation(transformedResult.position, board)
    );
    transformedResult.position = transformations.original;
    transformedResult.candidateMoves = transformedResult.candidateMoves.map(
      (move) => {
        const transformedMove = getVerticeTransformation(
          [move.point.x, move.point.y],
          transformation,
          board.width,
          board.height
        );
        return {
          ...move,
          point: {
            x: transformedMove[0],
            y: transformedMove[1]
          }
        };
      }
    );
    return transformedResult;
  }
  return dbPosition;
};

export const savePosition = async (board: GoBoard, player: Player) => {
  const dbBoard = await getBoard(board.width, board.height);
  // Create board if it doesn't exist

  const boardId = dbBoard?.id ?? (await addBoard(board.width, board.height));

  const { original: originalString, ...positionStrings } =
    getAllPositionStrings(board);

  const dbPosition = await getPositionFromBoard(board, player);

  const ko: Vertex =
    (board as GoBoardWithKo)._koInfo.sign === player
      ? (board as GoBoardWithKo)._koInfo.vertex
      : [-1, -1];

  // Create position if doesn't exist
  return (
    dbPosition?.id ?? (await addPosition(boardId, originalString, player, ko))
  );
};

const addPosition = async (
  boardId: IndexableType,
  positionString: string,
  player: number,
  ko: Vertex
) => {
  const db = await DatabaseApi.getDatabaseRepository();
  return await db.positions.add({
    boardDimensionId: boardId,
    position: positionString,
    ko: {
      x: ko[0],
      y: ko[1]
    },
    player,
    comments: "",
    evaluation: "",
    tag: "",
    candidateMoves: []
  } as Position);
};

export const updatePositionData = async (
  positionId: IndexableType,
  comments?: string,
  evaluation?: string,
  tag?: string
) => {
  const db = await DatabaseApi.getDatabaseRepository();
  return await db.positions.update(positionId, {
    comments,
    evaluation,
    tag
  });
};
