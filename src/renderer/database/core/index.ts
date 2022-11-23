// Dexie
import Dexie, { type Table } from 'dexie';

// Types
import type { Move, Position, Repository } from '../types';
import type { BoardDimension } from '../types/BoardDimension';

export class RepositoryManagerDatabase extends Dexie {
  repositories!: Table<Repository>;
  activeRepository!: Table<Repository>;
  constructor() {
    super('RepositoryManager');
    this.version(2).stores({
      repositories: '++id, name',
      activeRepository: '++id, name'
    });
  }
}
export const repositoryDb = new RepositoryManagerDatabase();

export class RepositoryDatabase extends Dexie {
  boardDimensions!: Table<BoardDimension>;
  positions!: Table<Position>;
  moves!: Table<Move>;

  constructor(name?: string) {
    super(name || 'default');
    this.version(1).stores({
      boardDimensions: '++id, [rows+columns]',
      positions: '++id, position, boardDimensionId, ko, tag', // Primary key and indexed props
      moves:
        '++id, point, positionId, previousPositionId, deck, nextSessionTimestamp'
    });
  }
}

let _db = new RepositoryDatabase();

export const switchRepository = async (name: string) => {
  _db = new RepositoryDatabase(name);
};

// Only use to make changes to a database instance without opening it up for user access
export const getNewDatabaseInstance = (name: string) => {
  return new RepositoryDatabase(name);
};

export { _db as db };
