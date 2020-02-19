import { BaseModel, getPersistenceMetadata, ModelType } from '@microgamma/datagator';

export abstract class BasePersistence<T extends BaseModel<any>> {
  protected modelFactory(doc): T {
    const model = getPersistenceMetadata(this).model;
    return new model(doc);
  }

  public abstract async getClient(): Promise<any>;

  public abstract async findAll(query: any): Promise<T[]>;

  public abstract async findOne(id: any): Promise<ModelType<T>>;

  public abstract async create(doc: ModelType<T>): Promise<ModelType<T>>;

  public abstract async update(doc: Partial<T>): Promise<any>;

  public abstract async delete(id): Promise<any>;

}

