export const alpha = "ABCDEFGHJKLMNOPQRSTUVWXYZ";
export const vertexEvents = [
  "Click",
  "MouseDown",
  "MouseUp",
  "MouseMove",
  "MouseEnter",
  "MouseLeave",
  "PointerDown",
  "PointerUp",
  "PointerMove",
  "PointerEnter",
  "PointerLeave",
];

export const range = (n: number) =>
  Array(n)
    .fill(0)
    .map((_, i) => i);

export const random = (n: number) => Math.floor(Math.random() * (n + 1));
export const neighborhood = ([x, y]: [number, number]) =>
  [
    [x, y],
    [x - 1, y],
    [x + 1, y],
    [x, y - 1],
    [x, y + 1],
  ] as [number, number][];

export const vertexEquals = (
  [x1, y1]: [number, number],
  [x2, y2]: [number, number]
) => x1 === x2 && y1 === y2;
export const lineEquals = (
  [v1, w1]: [[number, number], [number, number]],
  [v2, w2]: [[number, number], [number, number]]
) => vertexEquals(v1, v2) && vertexEquals(w1, w2);

// hoshi means star point
export const getHoshis: (width: number, height: number) => [number, number][] =
  (width, height) => {
    if (Math.min(width, height) <= 6) return [];

    const [nearX, nearY] = [width, height].map((x) => (x >= 13 ? 3 : 2));
    const [farX, farY] = [width - nearX - 1, height - nearY - 1];
    const [middleX, middleY] = [width, height].map((x) => (x - 1) / 2);

    const result: [number, number][] = [
      [nearX, farY],
      [farX, nearY],
      [farX, farY],
      [nearX, nearY],
    ];

    if (width % 2 !== 0 && height % 2 !== 0 && width !== 7 && height !== 7)
      result.push([middleX, middleY]);
    if (width % 2 !== 0 && width !== 7)
      result.push([middleX, nearY], [middleX, farY]);
    if (height % 2 !== 0 && height !== 7)
      result.push([nearX, middleY], [farX, middleY]);

    return result;
  };

export const readjustShifts = (
  shiftMap: number[][],
  vertex: [number, number] | null = null
) => {
  if (vertex == null) {
    for (let y = 0; y < shiftMap.length; y++) {
      for (let x = 0; x < shiftMap[0].length; x++) {
        readjustShifts(shiftMap, [x, y]);
      }
    }
  } else {
    const [x, y] = vertex;
    const direction = shiftMap[y][x];

    const data = [
      // Left
      [
        [1, 5, 8],
        [x - 1, y],
        [3, 7, 6],
      ],
      // Top
      [
        [2, 5, 6],
        [x, y - 1],
        [4, 7, 8],
      ],
      // Right
      [
        [3, 7, 6],
        [x + 1, y],
        [1, 5, 8],
      ],
      // Bottom
      [
        [4, 7, 8],
        [x, y + 1],
        [2, 5, 6],
      ],
    ];

    for (const [directions, [qx, qy], removeShifts] of data) {
      const setToZero =
        directions.includes(direction) &&
        shiftMap[qy] &&
        removeShifts.includes(shiftMap[qy][qx]);

      if (setToZero) {
        shiftMap[qy][qx] = 0;
      }
    }
  }

  return shiftMap;
};

export const diffSignMap = (
  before: number[][],
  after: number[][]
): [number, number][] => {
  if (
    before === after ||
    before.length === 0 ||
    before.length !== after.length ||
    before[0].length !== after[0].length
  ) {
    return [];
  }

  const result: [number, number][] = [];

  for (let y = 0; y < before.length; y++) {
    for (let x = 0; x < before[0].length; x++) {
      if (before[y][x] === 0 && after[y] != null && after[y][x]) {
        result.push([x, y]);
      }
    }
  }

  return result;
};

export const getValueAtVertex = <T>(
  map: T[][] | null | undefined,
  vertex: [number, number],
  defaultValue?: T
) => {
  const [x, y] = vertex;
  return !!map && map[y] != null && map[y][x] != null
    ? map[y][x]
    : defaultValue;
};

export const hasVertex = (
  vertexArray: [number, number][] | undefined,
  vertex: [number, number]
) => {
  return vertexArray?.some((v) => vertexEquals(v, vertex));
};

export default {
  alpha,
  vertexEvents,
  range,
  random,
  neighborhood,
  vertexEquals,
  lineEquals,
  getHoshis,
  readjustShifts,
  diffSignMap,
  getValueAtVertex,
  hasVertex,
};
