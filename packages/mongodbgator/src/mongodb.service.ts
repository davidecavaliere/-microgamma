import { getDebugger } from '@microgamma/loggator';
import { ObjectID } from 'bson';
import { Collection, MongoClient, MongoClientOptions } from 'mongodb';
import { BaseModel, getPersistenceMetadata, ModelType, BasePersistence, PersistenceServiceOptions } from '@microgamma/datagator';

const d = getDebugger('microgamma:persistence:service');

export interface MongoDBPersistenceOptions extends PersistenceServiceOptions {
  collection: string;
  uri: string;
  dbName: string;
  options?: MongoClientOptions;
}

interface Query {
  [k: string]: string;
}

export abstract class MongodbService<T extends BaseModel<any>> extends BasePersistence<T>{

  protected uri: string;
  protected options: MongoClientOptions;
  protected dbName: string;
  protected collectionName: string;

  protected _client: MongoClient;
  protected _collection: Collection;

  public async getClient(): Promise<MongoClient> {


    if (!this._client) {
      const metadata = getPersistenceMetadata(this) as unknown as MongoDBPersistenceOptions;
      d('got metadata', metadata);

      this.uri = metadata.uri;
      this.dbName = metadata.dbName;
      this.collectionName = metadata.collection;
      this.options = {
        ...metadata.options,
        useNewUrlParser: true
      };

      this._client = await MongoClient.connect(this.uri, this.options);
      this._collection = this._client.db(this.dbName).collection(this.collectionName);
    }

    return this._client;
  }

  public async getCollection(): Promise<Collection> {
    await this.getClient();
    return this._client.db(this.dbName).collection(this.collectionName);
  }


  public async findAll(query?: Query) {
    const docs = await (await this.getCollection()).find(query).toArray();

    const parsedDocs: any[] = [];

    for (const doc of docs) {
      parsedDocs.push(this.modelFactory(doc));
    }

    return parsedDocs;
  }

  public async findOne(id: string) {
    d(`searching document by id ${id}`);
    const objId = new ObjectID(id);

    const doc = await (await this.getCollection()).findOne({_id: objId});

    d('found document', doc);
    if (!doc) {
      throw new Error('[404] document not found');
    } else {
      return this.modelFactory(doc);
    }
  }

  public async create(doc: ModelType<T>): Promise<T> {
    const parsedDoc = this.modelFactory(doc);
    const resp = await (await this.getCollection()).insertOne(parsedDoc);
    return resp.ops.pop();
  }

  public async update(doc: Partial<T>) {
    const parseDoc = this.modelFactory(doc);
    const objId = new ObjectID(parseDoc.primaryKey);

    return (await this.getCollection()).findOneAndUpdate({_id: objId}, doc);

  }

  public async delete(id) {
    const objId = new ObjectID(id);
    return (await this.getCollection()).findOneAndDelete({_id: objId});
  }
}
