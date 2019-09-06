import { BaseModel } from '../model';

export interface PersistenceClient<M extends BaseModel> {

  findAll: (query?) => Promise<M[]>;
  findOne: (id: string) => Promise<M>;
  create: (doc: M) => Promise<M>;
  update: (doc: M) => Promise<M>;
  delete: (id) => Promise<void>;
}
