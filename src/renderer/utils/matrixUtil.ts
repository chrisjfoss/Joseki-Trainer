import type { Vertex } from '@sabaki/go-board';

export type TransformationCollection<T> = Record<
  keyof typeof Transformation,
  T[][]
>;

export enum Transformation {
  original,
  rot90,
  rot180,
  rot270,
  mirror,
  mirrorRot90,
  mirrorRot180,
  mirrorRot270
}

export const getArrayTransformations = <T>(
  array: T[][]
): TransformationCollection<T> => {
  const rotations: T[][][] = new Array(8).fill(null);
  rotations[0] = [];
  rotations[1] = [];
  rotations[2] = [];
  rotations[3] = [];
  rotations[4] = [];
  rotations[5] = [];
  rotations[6] = [];
  rotations[7] = [];
  for (let i = 0; i < array.length; i++) {
    rotations.forEach((rotation) => {
      rotation.push([]);
    });
    for (let j = 0; j < array[i].length; j++) {
      // Original
      rotations[0][i].push(array[i][j]);
      // 90 degrees
      rotations[1][i].push(array[j][array.length - i - 1]);
      // 180 degrees
      rotations[2][i].push(
        array[array.length - i - 1][array[i].length - j - 1]
      );
      // 270 degrees
      rotations[3][i].push(array[array[i].length - j - 1][i]);
      // Mirrored
      rotations[4][i].push(array[i][array[i].length - j - 1]);
      // Mirrored 90 degrees
      rotations[5][i].push(
        array[array[i].length - j - 1][array.length - i - 1]
      );
      // Mirrored 180 degrees
      rotations[6][i].push(array[array.length - i - 1][j]);
      // Mirrored 270 degrees
      rotations[7][i].push(array[j][i]);
    }
  }
  return {
    original: rotations[0],
    rot90: rotations[1],
    rot180: rotations[2],
    rot270: rotations[3],
    mirror: rotations[4],
    mirrorRot90: rotations[5],
    mirrorRot180: rotations[6],
    mirrorRot270: rotations[7]
  };
};

export const getTransformation = <T>(
  transformation: Transformation,
  array: T[][]
): T[][] => {
  const transformedArray: T[][] = [];
  for (let i = 0; i < array.length; i++) {
    transformedArray[i] = new Array(array[i].length).fill(0);
    for (let j = 0; j < array[i].length; j++) {
      switch (transformation) {
        case Transformation.original:
          transformedArray[i][j] = array[i][j];
          break;
        case Transformation.rot90:
          // y, x mod+
          transformedArray[i][j] = array[j][array.length - i - 1];
          break;
        case Transformation.rot180:
          transformedArray[i][j] =
            array[array.length - i - 1][array[i].length - j - 1];
          break;
        case Transformation.rot270:
          transformedArray[i][j] = array[array[i].length - j - 1][i];
          break;
        case Transformation.mirror:
          transformedArray[i][j] = array[i][array[i].length - j - 1];
          break;
        case Transformation.mirrorRot90:
          transformedArray[i][j] =
            array[array[i].length - j - 1][array.length - i - 1];
          break;
        case Transformation.mirrorRot180:
          transformedArray[i][j] = array[array.length - i - 1][j];
          break;
        case Transformation.mirrorRot270:
          transformedArray[i][j] = array[j][i];
          break;
      }
    }
  }
  return transformedArray;
};

export const getVerticeTransformation = (
  vertex: Vertex,
  transformation: Transformation,
  width: number,
  height: number
): Vertex => {
  const [x, y] = vertex;
  if (x === -1 && y === -1) {
    return vertex;
  }
  switch (transformation) {
    case Transformation.original:
      return vertex;
    case Transformation.rot90:
      return [y, width - x - 1];
    case Transformation.rot180:
      return [width - x - 1, height - y - 1];
    case Transformation.rot270:
      return [height - y - 1, x];
    case Transformation.mirror:
      return [width - x - 1, y];
    case Transformation.mirrorRot90:
      return [y, x];
    case Transformation.mirrorRot180:
      return [x, height - y - 1];
    case Transformation.mirrorRot270:
      return [height - y - 1, width - x - 1];
  }
};
