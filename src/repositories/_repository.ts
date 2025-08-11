interface RepositoryRecord {
  id: number;
  [key: string]: any;
}

interface TimestampRepositoryRecord {
  timestamp: number;
  [key: string]: any;
}

export interface Repository<T extends RepositoryRecord> {
  list(filter?: (record: T) => boolean): Promise<T[]>;
  create(data: Omit<T, "id">): Promise<T>;
  read(id: number): Promise<T>;
  update(id: number, data: Omit<T, "id">): Promise<T>;
  delete(id: number): Promise<void>;
}

export interface TimestampRepository<T extends TimestampRepositoryRecord> {
  list(filter?: (record: T) => boolean): Promise<T[]>;
  create(data: Omit<T, "timestamp">): Promise<T>;
  read(timestamp: number): Promise<T>;
  update(timestamp: number, data: Omit<T, "timestamp">): Promise<T>;
  delete(timestamp: number): Promise<void>;
}
