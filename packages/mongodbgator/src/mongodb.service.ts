import { getDebugger } from '@microgamma/loggator';
import { ObjectID } from 'bson';
import { Collection, MongoClient, MongoClientOptions } from 'mongodb';
import { BaseModel, getPersistenceMetadata, MongoDBPersistenceOptions } from '@microgamma/datagator';

const d = getDebugger('microgamma:persistence:service');


interface Query {
  [k: string]: string;
}

export abstract class MongodbService<T extends BaseModel<any>> {

  protected uri: string;
  protected options: MongoClientOptions;
  protected dbName: string;
  protected collectionName: string;

  protected _client: MongoClient;
  protected _collection: Collection;

  protected modelFactory(doc): T {
    const model = getPersistenceMetadata(this).model;
    return new model(doc);
  }

  public async getClient(): Promise<MongoClient> {


    if (!this._client) {
      const metadata = getPersistenceMetadata(this) as MongoDBPersistenceOptions;
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

  public async create(doc: T) {
    // tslint:disable: no-parameter-reassignment
    doc = this.modelFactory(doc);
    const resp = (await this.getCollection()).insertOne(doc);

    return resp.ops.pop();
  }

  public async update(doc) {
    const objId = new ObjectID(doc._id);

    return (await this.getCollection()).findOneAndUpdate({_id: objId}, doc);

  }

  public async delete(id) {
    const objId = new ObjectID(id);
    return (await this.getCollection()).findOneAndDelete({_id: objId});
  }
}
