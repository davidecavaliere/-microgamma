// tslint:disable:no-expression-statement no-object-mutation member-access max-classes-per-file
import { getDebugger } from '@microgamma/loggator';
import { BaseModel, Column } from '../model';
import { Persistence } from '../persistence';
import { DynamodbService } from './dynamodb.service';
import DynamoDB = require('aws-sdk/clients/dynamodb');
import { SetOnlyType } from '../model/base-model.types';

const d = getDebugger('microgamma:datagator:dynamodb.integration');

describe('DynamoDB integration test', () => {

  class User extends BaseModel<User> {

    @Column({
      primaryKey: true
    })
    id?: string;

    @Column({
      private: true
    })
    public hashedPassword?: string;

    public set password(password: SetOnlyType<string>) {
      this.hashedPassword = password.repeat(2);
    };

    @Column()
    name: string;
    @Column()
    email: string;
    @Column()
    role: string;

    @Column()
    settings?: {
      [k: string]: any
    };
  }

  const persistenceMetadata = {
    tableName: 'users',
    model: User,
    options: {
      endpoint: 'http://localhost:8000',
      region: 'local-env'
    }
  };

  @Persistence(persistenceMetadata)
  class UserPersistenceService extends DynamodbService<User> {}


  let instance: UserPersistenceService;

  let dynamo;

  beforeAll(async () => {
    instance = new UserPersistenceService();

    dynamo = new DynamoDB({
      endpoint: 'http://localhost:8000',
      region: 'local-env'
    });

    d('dynamo endpoint', dynamo.endpoint);

  });

  beforeEach(async () => {

    const tables = await dynamo.listTables({}).promise();

    d('tables', tables);
  });

  it('should instantiate', () => {
    expect(instance).toBeTruthy();
  });

  describe('#findAll', () => {
    it('should get users', async () => {
      const users = await instance.findAll();

      expect(users).toEqual([]);
    });

  });

  describe('#findOne', () => {
    let userId;

    beforeEach(async () => {
      const user = {
        name: 'name_',
        email: 'email_',
        role: 'role_',
        settings: {}
      };

      const resp = await instance.create({
        ...user,
        password: 'password_'
      });

      userId = resp.primaryKey;
    });


    it('should find a user by primary key', async () => {

      const {id, ...user} = await instance.findOne({id: userId});

      expect(id).toEqual(expect.anything());

      expect(user).toEqual({
        email: 'email_',
        name: 'name_',
        role: 'role_',
        settings: {},
        hashedPassword: 'password_password_'
      });

    });
  });

  describe('#create', () => {

    it('should create a user', async () => {
      const user = {
        name: 'name_',
        email: 'email_',
        role: 'role_',
        settings: {}
      };



      const resp = await instance.create({
        ...user,
        password: 'password_'
      });

      const expected = {
        ...user,
        id: expect.anything(),
        settings: {},
        hashedPassword: 'password_password_'
      };



      expect(resp).toEqual(new User(expected));

    });
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

      expect(resp).toEqual(new User({
        id: doc.id,
        name: 'name2',
        email: 'email2',
        role: 'role2',
        hashedPassword: 'newpasswordnewpassword',
        settings: {}
      }));
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

      expect(resp).toEqual(new User({
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
      }));

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

      const resp = await instance.delete(doc);

      expect(resp).toEqual({});


      const users = await instance.findAll();

      expect(users.indexOf(doc)).toEqual(-1);
    });
  });


});