import { db } from "../db";

export const deleteDatabase = async () => {
  await db.delete();
  await db.open();
};
