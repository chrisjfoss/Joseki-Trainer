import GoBoard, { type Sign, type SignMap } from '@sabaki/go-board';

// Types
import type { Vertex } from '@/components/GoBoard/ShudanPort/types';
import type { DatabaseTypes } from '@/database';

// Utils
import { cloneDeep } from 'lodash';
import { getAllPositionStrings, getRelativeTransformation, Matrix } from '.';

interface GoBoardWithKo extends GoBoard {
  _koInfo: { sign: Sign; vertex: Vertex };
}

export const getBoardFromPosition = (
  position: DatabaseTypes.Position,
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
  position: DatabaseTypes.Position,
  width: number,
  height: number
): SignMap => {
  const signMap: SignMap = [];
  for (let i = 0; i < width; i++) {
    signMap.push([] as Sign[]);
    for (let j = 0; j < height; j++) {
      const sign = (Number.parseInt(position.position[i * width + j]) -
        1) as Sign;
      signMap[i].push(sign);
    }
  }
  return signMap;
};

export const applyRandomTransformation = (board: GoBoard) => {
  // Get random enum from Matrix.Transformation
  const randomTransformation = Math.floor(
    (Math.random() * Object.keys(Matrix.Transformation).length) / 2
  ) as Matrix.Transformation;

  return applyTransformation(board, randomTransformation);
};

export const applyTransformation = (
  board: GoBoard,
  transformation: Matrix.Transformation
) => {
  const newBoard = cloneDeep(board) as GoBoardWithKo;

  // Get new signMap
  newBoard.signMap = Matrix.getTransformation(transformation, board.signMap);

  // Apply transform to ko
  newBoard._koInfo.vertex = Matrix.getVerticeTransformation(
    newBoard._koInfo.vertex,
    transformation,
    board.width,
    board.height
  );
  newBoard.height = newBoard.signMap.length;
  newBoard.width = newBoard.signMap[0].length;
  return newBoard;
};

export const areEqualWithTransformation = (a: GoBoard, b: GoBoard) => {
  const getATransformations = getAllPositionStrings(a);
  const getBTransformations = getAllPositionStrings(b);
  const aTransformationKeys = Object.keys(
    getATransformations
  ) as (keyof typeof Matrix.Transformation)[];
  const bTransformationKeys = Object.keys(
    getBTransformations
  ) as (keyof typeof Matrix.Transformation)[];

  for (let i = 0; i < aTransformationKeys.length; i++) {
    const aKey = aTransformationKeys[i];
    for (let j = 0; j < bTransformationKeys.length; j++) {
      const bKey = bTransformationKeys[j];
      if (getATransformations[aKey] === getBTransformations[bKey]) {
        return {
          equal: true,
          transformation: getRelativeTransformation(
            Matrix.Transformation[aKey as keyof typeof Matrix.Transformation],
            Matrix.Transformation[bKey as keyof typeof Matrix.Transformation]
          )
        };
      }
    }
  }
  return {
    equal: false,
    transformation: Matrix.Transformation.original
  };
};
