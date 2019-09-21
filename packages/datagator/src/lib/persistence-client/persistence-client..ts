import { BaseModel } from '../model';
import { Function } from 'aws-sdk/clients/greengrass';

export interface PersistenceClient<M extends BaseModel<Function>> {

  findAll: (query?) => Promise<M[]>;
  findOne: (id: string) => Promise<M>;
  create: (doc: M) => Promise<M>;
  update: (doc: M) => Promise<M>;
  delete: (id) => Promise<void>;
}
