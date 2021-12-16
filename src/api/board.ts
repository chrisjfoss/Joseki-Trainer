import { db } from "../db";

export const getBoard = (width: number, height: number) => {
  return db.boardDimensions
    .where("[rows+columns]")
    .equals([height, width])
    .first();
};

export const addBoard = async (width: number, height: number) => {
  return await db.boardDimensions.add({
    rows: height,
    columns: width
  });
};
