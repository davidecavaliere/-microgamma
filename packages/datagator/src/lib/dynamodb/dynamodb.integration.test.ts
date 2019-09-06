// tslint:disable:no-expression-statement no-object-mutation member-access max-classes-per-file
import { getDebugger } from '@microgamma/loggator';
import { config } from 'aws-sdk';
import { BaseModel, Column } from '../model';
import { Persistence } from '../persistence';
import { DynamodbService } from './dynamodb.service';
import DynamoDB = require('aws-sdk/clients/dynamodb');

const d = getDebugger('microgamma:datagator:dynamodb.integration');

describe('DynamoDB integration test', () => {

  config.update({
    region: 'eu-west-1'
  });

  class User extends BaseModel {

    @Column()
    id?;

    @Column()
    private hashedPassword?: string;

    public set password(password: string) {
      d('this in setter function is', this);
      d('setting password', password);
      this.hashedPassword = password.repeat(2);
      d('encryptedPassword', this.hashedPassword);

    };

    @Column()
    name;
    @Column()
    email;
    @Column()
    role;

    @Column()
    settings?: {
      [k: string]: any
    };
  }

  const persistenceMetadata = {
    tableName: 'users',
    model: User,
    options: {
      endpoint: 'http://localhost:8080'
    }
  };

  @Persistence(persistenceMetadata)
  class UserPersistenceService extends DynamodbService<User> {}


  let instance: UserPersistenceService;

  let dynamo;

  beforeAll(() => {
    instance = new UserPersistenceService();
    config.update({ region: "us-east-1" });

    dynamo = new DynamoDB({
      endpoint: 'http://localhost:8080'
    });

    d('dynamo endpoint', dynamo.endpoint);

  });

  beforeEach(async () => {

    d('createTable');
    await dynamo.createTable({
      TableName: 'users',
      KeySchema: [{
        AttributeName: 'id',
        KeyType: 'HASH'
      }],
      AttributeDefinitions: [{
        AttributeName: 'id',
        AttributeType: 'S'
      }],
      BillingMode: 'PAY_PER_REQUEST'
    }).promise();


    d('describe table');
    await dynamo.describeTable({
      TableName: 'users'
    }).promise();
  });

  it('should instantiate', () => {
    expect(instance).toBeTruthy();
  });

  it('should get users', async () => {
    const users = await instance.findAll();

    expect(users).toEqual([]);
  });

  it('should create a user', async () => {
    const resp = await instance.create({
      name: 'name_',
      email: 'email_',
      password: 'password_',
      role: 'role_',
      settings: {}
    });

    const expected = {
      id: expect.anything(),
      name: 'name_',
      email: 'email_',
      role: 'role_',
      hashedPassword: 'password_password_',
      settings: expect.anything()
    };

    expect(resp).toEqual(expected);

    const users = await instance.findAll();

    expect(users).toEqual([expected]);
  });

  describe('#update', () => {

    let doc;

    beforeEach(async () => {
      doc = await instance.create({
        name: 'name_',
        email: 'email_',
        password: 'password_',
        role: 'role_',
        settings: {}
      });

    });

    it('should update an existing user', async () => {

      const resp = await instance.update({
        id: doc.id,
        name: 'name2',
        email: 'email2',
        role: 'role2',
        password: 'newpassword'
      });

      expect(resp).toEqual({
        id: doc.id,
        name: 'name2',
        email: 'email2',
        role: 'role2',
        hashedPassword: 'newpasswordnewpassword',
        settings: expect.anything()
      });
    });

    it('should updated an existing user -> nested objects', async () => {

      d('updating doc', doc);
      const resp = await instance.update({
        id: doc.id,
        name: 'name_',
        email: 'email_',
        role: 'role_',
        password: 'newpassword',
        settings: {
          one: 2,
          two: {
            value: 3
          }
        }
      });

      expect(resp).toEqual({
        id: doc.id,
        name: 'name_',
        email: 'email_',
        role: 'role_',
        hashedPassword: 'newpasswordnewpassword',
        settings: {
          one: 2,
          two: {
            value: 3
          }
        }
      });
    });
  });


  describe('#delete', () => {
    let doc;

    beforeEach(async () => {
      doc = await instance.create({
        name: 'name_',
        email: 'email_',
        password: 'password_',
        role: 'role_',
        settings: {}
      });
    });

    it('should delete an existing user', async () => {

      const resp = await instance.delete(doc.id);

      expect(resp).toEqual({});


      const users = await instance.findAll();

      expect(users).toEqual([]);
    });
  });


  afterEach(async () => {

    await dynamo.deleteTable({
      TableName: 'users'
    }).promise();

    d('table deleted');
    d('______________________________________')
    d('______________________________________')
    d('______________________________________')
    d('______________________________________')
    d('______________________________________')
    d('______________________________________')
    d('______________________________________')
  });

});