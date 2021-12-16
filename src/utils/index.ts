import Board, { Sign, Vertex } from "@sabaki/go-board";
import * as Matrix from "./matrixUtil";

class SingletonUtilStorage {
  public static storedBoard: Board;
  public static storedPositionStrings: Record<
    keyof Matrix.TransformationCollection<Sign>,
    string
  > = {
    original: "",
    rot90: "",
    rot180: "",
    rot270: "",
    mirror: "",
    mirrorRot90: "",
    mirrorRot180: "",
    mirrorRot270: ""
  };
}

const getPositionString = (position: Sign[][]) => {
  return position.reduce((accumulator, currentRow) => {
    return (
      accumulator +
      currentRow.reduce((rowString, currentValue) => {
        return rowString + (currentValue + 1).toString();
      }, "")
    );
  }, "");
};

const getInverseTransformation = (transformation: Matrix.Transformation) => {
  switch (transformation) {
    case Matrix.Transformation.rot90:
      return Matrix.Transformation.rot270;
    case Matrix.Transformation.rot180:
      return Matrix.Transformation.rot180;
    case Matrix.Transformation.rot270:
      return Matrix.Transformation.rot90;
    case Matrix.Transformation.mirror:
      return Matrix.Transformation.mirror;
    case Matrix.Transformation.mirrorRot90:
      return Matrix.Transformation.mirrorRot270;
    case Matrix.Transformation.mirrorRot180:
      return Matrix.Transformation.mirrorRot180;
    case Matrix.Transformation.mirrorRot270:
      return Matrix.Transformation.mirrorRot90;
    default:
      return Matrix.Transformation.original;
  }
};

const relativeTransformations = {
  [Matrix.Transformation.original]: {
    [Matrix.Transformation.original]: Matrix.Transformation.original,
    [Matrix.Transformation.rot90]: Matrix.Transformation.rot90,
    [Matrix.Transformation.rot180]: Matrix.Transformation.rot180,
    [Matrix.Transformation.rot270]: Matrix.Transformation.rot270,
    [Matrix.Transformation.mirror]: Matrix.Transformation.mirror,
    [Matrix.Transformation.mirrorRot90]: Matrix.Transformation.mirrorRot90,
    [Matrix.Transformation.mirrorRot180]: Matrix.Transformation.mirrorRot180,
    [Matrix.Transformation.mirrorRot270]: Matrix.Transformation.mirrorRot270
  },
  [Matrix.Transformation.rot90]: {
    [Matrix.Transformation.original]: Matrix.Transformation.rot270,
    [Matrix.Transformation.rot90]: Matrix.Transformation.original,
    [Matrix.Transformation.rot180]: Matrix.Transformation.rot90,
    [Matrix.Transformation.rot270]: Matrix.Transformation.rot180,
    [Matrix.Transformation.mirror]: Matrix.Transformation.mirrorRot270,
    [Matrix.Transformation.mirrorRot90]: Matrix.Transformation.mirror,
    [Matrix.Transformation.mirrorRot180]: Matrix.Transformation.mirrorRot90,
    [Matrix.Transformation.mirrorRot270]: Matrix.Transformation.mirrorRot180
  },
  [Matrix.Transformation.rot180]: {
    [Matrix.Transformation.original]: Matrix.Transformation.rot180,
    [Matrix.Transformation.rot90]: Matrix.Transformation.rot270,
    [Matrix.Transformation.rot180]: Matrix.Transformation.original,
    [Matrix.Transformation.rot270]: Matrix.Transformation.rot90,
    [Matrix.Transformation.mirror]: Matrix.Transformation.mirrorRot180,
    [Matrix.Transformation.mirrorRot90]: Matrix.Transformation.mirrorRot270,
    [Matrix.Transformation.mirrorRot180]: Matrix.Transformation.mirror,
    [Matrix.Transformation.mirrorRot270]: Matrix.Transformation.mirrorRot90
  },
  [Matrix.Transformation.rot270]: {
    [Matrix.Transformation.original]: Matrix.Transformation.rot90,
    [Matrix.Transformation.rot90]: Matrix.Transformation.rot180,
    [Matrix.Transformation.rot180]: Matrix.Transformation.rot270,
    [Matrix.Transformation.rot270]: Matrix.Transformation.original,
    [Matrix.Transformation.mirror]: Matrix.Transformation.mirrorRot90,
    [Matrix.Transformation.mirrorRot90]: Matrix.Transformation.mirrorRot180,
    [Matrix.Transformation.mirrorRot180]: Matrix.Transformation.mirrorRot270,
    [Matrix.Transformation.mirrorRot270]: Matrix.Transformation.mirror
  },
  [Matrix.Transformation.mirror]: {
    [Matrix.Transformation.original]: Matrix.Transformation.mirror,
    [Matrix.Transformation.rot90]: Matrix.Transformation.mirrorRot90,
    [Matrix.Transformation.rot180]: Matrix.Transformation.mirrorRot180,
    [Matrix.Transformation.rot270]: Matrix.Transformation.mirrorRot270,
    [Matrix.Transformation.mirror]: Matrix.Transformation.original,
    [Matrix.Transformation.mirrorRot90]: Matrix.Transformation.rot90,
    [Matrix.Transformation.mirrorRot180]: Matrix.Transformation.rot180,
    [Matrix.Transformation.mirrorRot270]: Matrix.Transformation.rot270
  },
  [Matrix.Transformation.mirrorRot90]: {
    [Matrix.Transformation.original]: Matrix.Transformation.mirrorRot270,
    [Matrix.Transformation.rot90]: Matrix.Transformation.mirror,
    [Matrix.Transformation.rot180]: Matrix.Transformation.mirrorRot90,
    [Matrix.Transformation.rot270]: Matrix.Transformation.mirrorRot180,
    [Matrix.Transformation.mirror]: Matrix.Transformation.rot270,
    [Matrix.Transformation.mirrorRot90]: Matrix.Transformation.original,
    [Matrix.Transformation.mirrorRot180]: Matrix.Transformation.rot90,
    [Matrix.Transformation.mirrorRot270]: Matrix.Transformation.rot180
  },
  [Matrix.Transformation.mirrorRot180]: {
    [Matrix.Transformation.original]: Matrix.Transformation.mirrorRot180,
    [Matrix.Transformation.rot90]: Matrix.Transformation.mirrorRot270,
    [Matrix.Transformation.rot180]: Matrix.Transformation.mirror,
    [Matrix.Transformation.rot270]: Matrix.Transformation.mirrorRot90,
    [Matrix.Transformation.mirror]: Matrix.Transformation.rot180,
    [Matrix.Transformation.mirrorRot90]: Matrix.Transformation.rot270,
    [Matrix.Transformation.mirrorRot180]: Matrix.Transformation.original,
    [Matrix.Transformation.mirrorRot270]: Matrix.Transformation.rot90
  },
  [Matrix.Transformation.mirrorRot270]: {
    [Matrix.Transformation.original]: Matrix.Transformation.mirrorRot90,
    [Matrix.Transformation.rot90]: Matrix.Transformation.mirrorRot180,
    [Matrix.Transformation.rot180]: Matrix.Transformation.mirrorRot270,
    [Matrix.Transformation.rot270]: Matrix.Transformation.mirror,
    [Matrix.Transformation.mirror]: Matrix.Transformation.rot90,
    [Matrix.Transformation.mirrorRot90]: Matrix.Transformation.rot180,
    [Matrix.Transformation.mirrorRot180]: Matrix.Transformation.rot270,
    [Matrix.Transformation.mirrorRot270]: Matrix.Transformation.original
  }
};
export const getRelativeTransformation = (
  initialTransformation: Matrix.Transformation,
  finalTransformation: Matrix.Transformation
) => {
  return relativeTransformations[initialTransformation][finalTransformation];
};

// positionString of board
const getAppliedTransformation = (
  transformedPositionString: string,
  board?: Board,
  positionStrings?: Record<keyof Matrix.TransformationCollection<Sign>, string>
) => {
  if (!positionStrings && !board) {
    throw new Error(
      "positionStrings must be provided if board is not provided"
    );
  }
  positionStrings = positionStrings ?? getAllPositionStrings(board as Board);
  const keys = Object.keys(
    positionStrings
  ) as (keyof typeof Matrix.Transformation)[];
  for (let i = 0; i < keys.length; i++) {
    if (
      positionStrings[
        keys[i] as keyof Matrix.TransformationCollection<Sign>
      ] === transformedPositionString
    ) {
      return Matrix.Transformation[keys[i]];
    }
  }
  return Matrix.Transformation.original;
};

const getAllPositionStrings = (board: Board) => {
  const transformations = Matrix.getArrayTransformations(board.signMap);
  if (board !== SingletonUtilStorage.storedBoard) {
    Object.keys(transformations).forEach((key) => {
      SingletonUtilStorage.storedPositionStrings[
        key as keyof Matrix.TransformationCollection<Sign>
      ] = getPositionString(
        transformations[key as keyof Matrix.TransformationCollection<Sign>]
      );
    });
    SingletonUtilStorage.storedBoard = board;
  }
  return SingletonUtilStorage.storedPositionStrings;
};

const getPositionStringForTransformation = (
  board: Board,
  transformation: Matrix.Transformation
) => {
  return getPositionString(
    Matrix.getTransformation(transformation, board.signMap)
  );
};

export {
  Matrix,
  getPositionString,
  getAllPositionStrings,
  getPositionStringForTransformation,
  getAppliedTransformation,
  getInverseTransformation
};
