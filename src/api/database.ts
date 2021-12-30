import { IndexableType } from "dexie";
import { db, switchRepository, repositoryDb } from "../db";

export const deleteDatabase = async () => {
  const database = await getDatabaseByName(db.name);
  await db.delete();
  if (database) {
    await repositoryDb.repositories.delete(database.id as IndexableType);
  }
  await db.open();
};

export const createDatabase = async (name: string) => {
  const database = await getDatabaseByName(name);
  if (db.name === name) {
    return;
  }
  if (!database && name !== "default") {
    console.log("Creating new database", name);
    console.log("Old Database: ", database);
    repositoryDb.repositories.add({ name });
  }
};

export const switchToDatabase = async (name: string) => {
  await createDatabase(name);
  db.close();
  switchRepository(name);
  await db.open();
};

export const getAvailableDatabases = async () => {
  const databases = await repositoryDb.repositories.toArray();
  return ["default", ...databases.map(({ name }) => name)];
};

export const getDatabaseByName = async (name: string) => {
  const database = await repositoryDb.repositories
    .where("name")
    .equals(name)
    .first();
  return database;
};
