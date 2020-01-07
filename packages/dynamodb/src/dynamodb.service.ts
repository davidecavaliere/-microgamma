
import { DynamoDB } from 'aws-sdk';
import { ObjectID } from 'bson';
import { DocumentClient } from 'aws-sdk/lib/dynamodb/document_client';
import ExpressionAttributeNameMap = DocumentClient.ExpressionAttributeNameMap;
import ConditionExpression = DocumentClient.ConditionExpression;
import { getDebugger } from '@microgamma/loggator';
import { BaseModel, DynamoDBPersistenceOptions, getPersistenceMetadata, ModelType } from '@microgamma/datagator';

const d = getDebugger('microgamma:datagator:dynamodb.service');

export abstract class DynamodbService<T extends BaseModel<any>> {

  private suffix = '_PlAcEhOlDeR';
  private metadata: DynamoDBPersistenceOptions;
  private readonly _ddb: DynamoDB.DocumentClient;
  private dynamo: DynamoDB;

  protected modelFactory(doc: Partial<ModelType<T>>): T {
    const model = this.metadata.model;
    return new model(doc);
  }

  public tableName: string;

  public get ddb() {
    return this._ddb;
  }

  constructor() {
    this.metadata = getPersistenceMetadata(this) as DynamoDBPersistenceOptions;
    this.tableName =  this.metadata.tableName;

    this.dynamo = new DynamoDB(this.metadata.options);
    this._ddb = new DynamoDB.DocumentClient(this.metadata.options);
  }

  public async findAll(query?: DynamoDB.QueryInput) {

    // TODO merge query into params

    const resp = await this.ddb.scan({
      TableName: this.tableName
    }).promise();

    d('resp', resp);
    const docs = resp.Items as Array<ModelType<T>>;
    d('docs', docs);

    const parsedDocs: any[] = [];

    for (const doc of docs) {
      parsedDocs.push(this.modelFactory(doc));
    }

    d('parsedDocs', parsedDocs);

    return parsedDocs;
  }

  public async findOne(doc: Partial<ModelType<T>>) {
    d(`searching document by`, doc);


    // TODO should only handle primary or secondary indexes below code should be a special case of findAll


    const parsedDoc = this.modelFactory(doc);
    d('parsed doc', parsedDoc);

    let query;

    if (doc.hasOwnProperty(parsedDoc.primaryKeyFieldName)) {
      d('searching by primary key... Shall we also parse over attributes if any?');
      const keyFieldName = parsedDoc.primaryKeyFieldName;

      query = {
        TableName: this.tableName,
        KeyConditionExpression: `#${keyFieldName} = :partitionKeyValue`,
        ExpressionAttributeNames: {
          [`#${keyFieldName}`]: keyFieldName
        },
        ExpressionAttributeValues: {
          ':partitionKeyValue': parsedDoc.primaryKey
        }

      };
    } else {
      query = {
        TableName: this.tableName,
        KeyConditionExpression: this.getConditionExpression(parsedDoc),
        ExpressionAttributeNames: this.getAttributeNames(parsedDoc),
        ExpressionAttributeValues: this.getAttributeValues(parsedDoc)
      };

    }

    d('query', query);

    const data = await this.ddb.query(query).promise();

    if (!data || data.Items.length === 0) {
      throw new Error('document not found');
    } else {
      d('found document', data);

      if (data.Items.length === 1) {
        return this.modelFactory(data.Items[0] as ModelType<T>);
      } else {
        throw new Error('more than one document found ')
      }
    }
  }

  public async create(doc: ModelType<T>) {

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
  public async update(doc: ModelType<T>, returnValueType = 'ALL_NEW') {

    d('doc', doc);

    const parsedDoc = this.modelFactory(doc);

    d('parsedDoc', parsedDoc);

    const updateExpression: string = this.getUpdateExpression(parsedDoc);
    const attributeValues = this.getAttributeValues(parsedDoc);
    const expressionAttributeNames = this.getAttributeNames(parsedDoc);

    d('update expression', updateExpression);
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
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: attributeValues,
      ExpressionAttributeNames: expressionAttributeNames,
      ReturnValues: returnValueType
    }).promise();

    return this.modelFactory(Attributes as ModelType<T>);
  }

  public async delete(doc: ModelType<T>) {
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

  protected getConditionExpression(doc: Partial<T>): ConditionExpression {
    return Object.keys(doc)
      .filter((field) => field !== doc.primaryKeyFieldName)
      .map((field) => {
        return `#${field} = :${field}${this.suffix}`;
      }).join(', ');
  }

  protected getUpdateExpression(doc: Partial<T>): string {

    return `SET ${this.getConditionExpression(doc)}`;
  }

  protected getAttributeNames(doc: Partial<T>): ExpressionAttributeNameMap {
    return Object.keys(doc)
      .filter((field) => field !== doc.primaryKeyFieldName)
      .reduce((attributeNames, field) => {
        attributeNames[`#${field}`] = field;
        return attributeNames;
      }, {});
  }

  protected getAttributeValues(doc: Partial<T>) {
    return Object.keys(doc)
      .filter((field) => field !== doc.primaryKeyFieldName)
      .reduce((attributeNames, field) => {
        attributeNames[`:${field}${this.suffix}`] = doc[field];
        return attributeNames;
      }, {});
  }
}
