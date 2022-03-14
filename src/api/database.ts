import { IndexableType } from "dexie";
import { db, switchRepository, repositoryDb } from "../db";
import { exportDB, importInto } from "dexie-export-import";
import { computed } from "vue";

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

export const getCurrentDatabaseName = () => {
  return db.name;
};

export const getCurrentRepositoryPlayer = async () => {
  const repository = await repositoryDb.repositories
    .where("name")
    .equals(db.name)
    .first();
  return repository?.player ?? 0;
};

export const switchToDatabase = async (name: string) => {
  await createDatabase(name);

  const activeRepository = await repositoryDb.activeRepository.toArray();
  if (activeRepository.length > 0 && activeRepository[0].id) {
    await repositoryDb.activeRepository.update(activeRepository[0].id, {
      name
    });
  } else {
    await repositoryDb.activeRepository.add({ name });
  }

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

export const exportDatabase = async () => {
  return await exportDB(db);
};

export const importDatabase = async (name: string, blob: Blob) => {
  await switchToDatabase(name);
  await importInto(db, blob, { acceptNameDiff: true });
};
