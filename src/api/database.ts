import { IndexableType } from "dexie";
import {
  db,
  switchRepository,
  repositoryDb,
  getNewDatabaseInstance
} from "../db";
import { exportDB, importInto } from "dexie-export-import";

export const deleteDatabase = async (name: string) => {
  const currentDatabase = getCurrentDatabaseName();
  const database = await getDatabaseByName(name);
  if (name === currentDatabase) {
    await switchToDatabase("default");
  }
  const dbToDelete = getNewDatabaseInstance(name);
  if (database) {
    await repositoryDb.repositories.delete(database.id as IndexableType);
  }
  await dbToDelete.delete();
};

export const createDatabase = async (
  name: string,
  player?: -1 | 0 | 1
): Promise<boolean> => {
  const database = await getDatabaseByName(name);
  if (db.name === name) {
    return false;
  }
  if (!database && name !== "default") {
    console.log("Creating new database", name);
    console.log("Old Database: ", database);
    repositoryDb.repositories.add({ name, player: player || 0 });
    console.log("Created database", name);
    return true;
  }
  return false;
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
  if (getCurrentDatabaseName() === name) {
    return;
  }
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
  await switchRepository(name);
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
  let increment = 0;
  let nameToUse = name;
  // Take first available name

  while (!(await createDatabase(nameToUse))) {
    increment += 1;
    nameToUse = `${name} (${increment})`;
  }
  await importInto(getNewDatabaseInstance(nameToUse), blob, {
    acceptNameDiff: true
  });
};
