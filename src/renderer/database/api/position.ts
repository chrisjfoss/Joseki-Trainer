import { type DatabaseTypes } from '@/database';
import { getBoard, addBoard } from './board';
import {
  getAllPositionStrings,
  getAppliedTransformation,
  getInverseTransformation
} from '@/utils';
import { getVerticeTransformation } from '@/utils/matrixUtil';
import type GoBoard from '@sabaki/go-board';
import { Sign, Vertex } from '@sabaki/go-board';
import { IndexableType } from 'dexie';
import { DatabaseApi, MoveApi } from '.';
import { Position } from '../types';

interface GoBoardWithKo extends GoBoard {
  _koInfo: { sign: Sign; vertex: Vertex };
}

export const getAllPositions = async (dbName?: string) => {
  const db = await DatabaseApi.getDatabaseRepository(dbName);
  return db.positions.toArray();
};

export const countReachablePositionsFromBoard = async (
  board: GoBoard,
  player: DatabaseTypes.Player,
  dbName?: string
) => {
  const position = await getOriginalPositionFromBoard(board, player, true, dbName);
  return position ? countReachablePositionsFromPosition(position, dbName) : 0;
};

export const countReachablePositionsFromPosition = async (
  startPosition: Position,
  dbName?: string
) => {
  let reachablePositions = 0;
  if(!startPosition.id) return 0;
  const reachedIds = [startPosition.id];
  let positionsToCount = [startPosition];
  while(positionsToCount.length > 0) {
    const position = positionsToCount.pop()!;
    positionsToCount = positionsToCount.concat(await getPositionsFromCandidateMoves(position, dbName, true, reachedIds));
    reachablePositions += 1;
  }
  return reachablePositions;
};

export const getPositionsFromCandidateMoves = (position: Position, dbName?: string, includeCandidateMoves?: boolean, filteredPositionIds?: number[]) => {
  return Promise.all(
    position.candidateMoves.map(
      (move) => filteredPositionIds?.includes(move.positionId as number) 
        ? undefined 
        : getPositionById(move.positionId, includeCandidateMoves, dbName)
      )
      .filter(position => !!position) as Promise<DatabaseTypes.Position>[]
    )
}

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
  player: DatabaseTypes.Player,
  includeCandidateMoves?: boolean,
  dbName?: string
) => {
  const db = await DatabaseApi.getDatabaseRepository(dbName);
  const position = await db.transaction('r', db.positions, db.moves, async () => {
    // Get all position transformations
    const { original, ...positionStrings } = getAllPositionStrings(board);

    // Get all db positions that match any position transformations
    const returnValue = Object.keys(positionStrings).reduce((acc, current) => {
      return acc
        .or('position')
        .equals(positionStrings[current as keyof typeof positionStrings]);
    }, db.positions.where('position').equals(original));

    return returnValue
      .filter((position) => {
        const { ko, player: nextPlayer } = position;
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
    if (position && includeCandidateMoves) {
      // Get all moves for the position
      position.candidateMoves = await MoveApi.getMovesByPositionId(
        position.id as IndexableType,
        dbName
      );
    }

    return position;
};

export const getPositionFromBoard = async (
  board: GoBoard,
  player: DatabaseTypes.Player,
  includeCandidateMoves?: boolean,
  dbName?: string
) => {
  const dbPosition = await getOriginalPositionFromBoard(board, player, includeCandidateMoves, dbName);
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

export const savePosition = async (
  board: GoBoard,
  player: DatabaseTypes.Player
) => {
  const dbBoard = await getBoard(board.width, board.height);
  // Create board if it doesn't exist

  const boardId =
    dbBoard?.id ?? ((await addBoard(board.width, board.height)) as number);

  const { original: originalString } = getAllPositionStrings(board);

  const dbPosition = await getPositionFromBoard(board, player);

  const ko: Vertex =
    (board as GoBoardWithKo)._koInfo.sign === player
      ? (board as GoBoardWithKo)._koInfo.vertex
      : [-1, -1];

  // Create position if doesn't exist
  return (
    dbPosition?.id ?? (addPosition(boardId, originalString, player, ko))
  );
};

const addPosition = async (
  boardId: number,
  positionString: string,
  player: DatabaseTypes.Player,
  ko: Vertex
) => {
  const db = await DatabaseApi.getDatabaseRepository();
  return db.positions.add({
    boardDimensionId: boardId,
    position: positionString,
    ko: {
      x: ko[0],
      y: ko[1]
    },
    player,
    comments: '',
    evaluation: '',
    tag: '',
    candidateMoves: []
  });
};

export const updatePositionData = async (
  positionId: IndexableType,
  comments?: string,
  evaluation?: string,
  tag?: string
) => {
  const db = await DatabaseApi.getDatabaseRepository();
  return db.positions.update(positionId, {
    comments,
    evaluation,
    tag
  });
};
