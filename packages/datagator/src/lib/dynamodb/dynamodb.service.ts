import { getDebugger } from '@microgamma/loggator';
import { DynamoDB } from 'aws-sdk';
import { BaseModel } from '../model';
import { DynamoDBPersistenceOptions, getPersistenceMetadata } from '../persistence';
import { ObjectID } from 'bson';

const d = getDebugger('microgamma:datagator:dynamodb.service');

export abstract class DynamodbService<T extends BaseModel> {

  private metadata: DynamoDBPersistenceOptions;

  public tableName: string;

  private _ddb: DynamoDB.DocumentClient;

  public get ddb() {
    return this._ddb;
  }

  private dynamo: DynamoDB;

  protected modelFactory(doc): T {
    const model = this.metadata.model;
    return new model(doc);
  }

  constructor() {
    this.metadata = getPersistenceMetadata(this) as DynamoDBPersistenceOptions;
    this.tableName =  this.metadata.tableName;

    this.dynamo = new DynamoDB(this.metadata.options);
    this._ddb = new DynamoDB.DocumentClient(this.metadata.options);

    d('endpoint', this.dynamo.endpoint);
  }

  public async findAll(query?: DynamoDB.QueryInput) {

    // TODO merge query into params

    const resp = await this.ddb.scan({
      TableName: this.tableName
    }).promise();

    d('resp', resp);
    const docs = resp.Items;
    d('docs', docs);


    const parsedDocs: any[] = [];

    for (const doc of docs) {
      parsedDocs.push(this.modelFactory(doc));
    }

    d('parsedDocs', parsedDocs);

    return parsedDocs;
  }

  public async findOne(id: string) {
    d(`searching document by id ${id}`);

    // TODO have a better solution
    const emptyModel = this.modelFactory({});

    const query = {
      TableName: this.tableName,
      Key: {
        [emptyModel.primaryKeyFieldName]: id
      }
    };
    d('query', query);

    const data = await this.ddb.get(query).promise();

    if (!data) {
      throw new Error('document not found');
    } else {
      d('found document', data);
      return this.modelFactory(data.Item);
    }
  }

  public async create(doc: Partial<T>) {

    // const parsedDoc = this.modelFactory(doc);
    // TODO add doc validation

    const id = new ObjectID().toHexString();
    d('doc', doc);
    const item = this.modelFactory(doc);
    d('item', item);
    item.primaryKey = id;
    d('item.primaryKey', item.primaryKey);
    d('putting item', item);
    await this.ddb.put({
      TableName: this.tableName,
      Item: item

    }).promise();


    return item;

  }

  /**
   * Updates a given document.
   *
   * TODO: implement logic to delete undefined fields?
   * TODO: implement logic to avoid creation of updateExpression for fields that do not change
   *
   * @param doc
   * @param returnValueType
   */
  public async update(doc: Partial<T>, returnValueType = 'ALL_NEW') {
    const suffix = '_PlAcEhOlDeR';
    
    d('doc', doc);

    const parsedDoc = this.modelFactory(doc);

    d('parsedDoc', parsedDoc);

    const updateExpression: string[] = [];
    const attributeValues = {};
    const expressionAttributeNames = {};

    Object.keys(parsedDoc)
      .filter((field) => field !== parsedDoc.primaryKeyFieldName)
      .forEach((field) => {
        const value = parsedDoc[field];

        if (!value) {
          // if value is falsy don't create update instructions
          return;
        }

        updateExpression.push(`#${field} = :${field}${suffix}`);

        expressionAttributeNames[`#${field}`] = field;
        attributeValues[`:${field}${suffix}`] = value;
      });

    d('update expression', updateExpression.join(', '));
    d('attributeValues', attributeValues);
    d('expressionAttributeNames', expressionAttributeNames);


    const keyCondition = {
      [parsedDoc.primaryKeyFieldName]: parsedDoc.primaryKey
    };

    d('keyCondition', keyCondition);
    
    const {
      Attributes
    } = await this.ddb.update({
      TableName: this.tableName,
      Key: keyCondition,
      UpdateExpression: `SET ${updateExpression.join(', ')}`,
      ExpressionAttributeValues: attributeValues,
      ExpressionAttributeNames: expressionAttributeNames,
      ReturnValues: returnValueType
    }).promise();


    return this.modelFactory(Attributes);
  }

  public async delete(doc: Partial<T>) {
    const _doc = this.modelFactory(doc);
    d('_doc', _doc);

    const keyCondition = {
      [_doc.primaryKeyFieldName]: _doc.primaryKey
    };

    d('keyCondition', keyCondition);

    return this.ddb.delete({
      TableName: this.tableName,
      Key: keyCondition
    }).promise();
  }
}
