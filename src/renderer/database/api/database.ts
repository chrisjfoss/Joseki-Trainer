import { IndexableType } from "dexie";
import {
  DatabaseCore
} from "..";
import { exportDB, importInto } from "dexie-export-import";

export const deleteDatabase = async (name: string) => {
  const currentDatabase = getCurrentDatabaseName();
  const database = await getDatabaseByName(name);
  if (name === currentDatabase) {
    await switchToDatabase("default");
  }
  const dbToDelete = DatabaseCore.getNewDatabaseInstance(name);
  if (database) {
    await DatabaseCore.repositoryDb.repositories.delete(database.id as IndexableType);
  }
  await dbToDelete.delete();
};

export const createDatabase = async (
  name: string,
  player?: -1 | 0 | 1
): Promise<boolean> => {
  const database = await getDatabaseByName(name);
  if (DatabaseCore.db.name === name) {
    return false;
  }
  if (!database && name !== "default") {
    console.log("Creating new database", name);
    console.log("Old Database: ", database);
    DatabaseCore.repositoryDb.repositories.add({ name, player: player || 0 });
    console.log("Created database", name);
    return true;
  }
  return false;
};

export const renameDatabase = async (
  oldName: string,
  newName: string
): Promise<boolean> => {
  const newDatabase = await getDatabaseByName(newName);
  if (newDatabase) {
    throw new Error("Name already taken");
  }
  const oldDb = await exportDatabase(oldName);
  await importDatabase(newName, oldDb);
  await deleteDatabase(oldName);

  return true;
};

export const getCurrentDatabaseName = () => {
  return DatabaseCore.db.name;
};

export const getRepositoryPlayer = async (name?: string) => {
  const dbName = name ? name : getCurrentDatabaseName();
  const repository = await DatabaseCore.repositoryDb.repositories
    .where("name")
    .equals(dbName)
    .first();
  return repository?.player ?? 0;
};

export const switchToDatabase = async (name: string) => {
  if (getCurrentDatabaseName() === name) {
    return;
  }
  await createDatabase(name);

  const activeRepository = await DatabaseCore.repositoryDb.activeRepository.toArray();
  if (activeRepository.length > 0 && activeRepository[0].id) {
    await DatabaseCore.repositoryDb.activeRepository.update(activeRepository[0].id, {
      name
    });
  } else {
    await DatabaseCore.repositoryDb.activeRepository.add({ name });
  }
  DatabaseCore.db.close();
  await DatabaseCore.switchRepository(name);
  await DatabaseCore.db.open();
};

export const getAvailableDatabases = async () => {
  const databases = await DatabaseCore.repositoryDb.repositories.toArray();
  return ["default", ...databases.map(({ name }) => name)];
};

export const getDatabaseByName = async (name: string) => {
  const database = await DatabaseCore.repositoryDb.repositories
    .where("name")
    .equals(name)
    .first();
  return database;
};

export const getDatabaseRepository = async (name?: string) => {
  return name ? DatabaseCore.getNewDatabaseInstance(name) || DatabaseCore.db : DatabaseCore.db;
};

export const exportDatabase = async (name?: string) => {
  const localDb = await getDatabaseRepository(name);
  return await exportDB(localDb);
};

export const importDatabase = async (name: string, blob: Blob) => {
  let increment = 0;
  let nameToUse = name;
  // Take first available name

  while (!(await createDatabase(nameToUse))) {
    increment += 1;
    nameToUse = `${name} (${increment})`;
  }
  await importInto(DatabaseCore.getNewDatabaseInstance(nameToUse), blob, {
    acceptNameDiff: true
  });
};
