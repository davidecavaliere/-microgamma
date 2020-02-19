// tslint:disable:no-expression-statement no-object-mutation member-access max-classes-per-file
import { getDebugger } from '@microgamma/loggator';
import { DynamodbService } from './dynamodb.service';
import { service } from 'aws-sdk/clients/health';
import { BaseModel, Column, BasePersistence } from '@microgamma/datagator';

const d = getDebugger('microgamma:datagator:dynamodb.service.spec');

describe('DynamodbService', () => {


  class User extends BaseModel<User> {

    @Column({
      primaryKey: true
    })
    id;

    @Column({
      private: true
    })
    password;
    @Column()
    name;
    @Column()
    email;
    @Column()
    role;
  }

  const persistenceMetadata = {
    tableName: 'users_table',
    model: User,
    options: {
      endpoint: 'http://localhost:8080',
      region: 'localhost'
    }
  };

  @Persistence(persistenceMetadata)
  class UserPersistenceService extends DynamodbService<User> {}



  let instance: UserPersistenceService;

  const scanMock = jest.fn().mockReturnValue({
    promise: jest.fn().mockResolvedValue({
      Items: [
        {id: 'id', name: 'name', email: 'email', role: 'role', password: 'password'}
      ]
    })
  });

  const getMock = jest.fn().mockReturnValue({
    promise: jest.fn().mockResolvedValue({
      Item: {
        id: 'id',
        name: 'name',
        email: 'email',
        role: 'role',
        password: 'password'
      }
    })
  });

  const queryMock = jest.fn().mockReturnValue({
    promise: jest.fn().mockResolvedValue({
      Items: [{
        id: 'id',
        name: 'name',
        email: 'email',
        role: 'role',
        password: 'password'
      }]
    })
  });

  // TODO find a real response example
  const putMock = jest.fn().mockReturnValue({
    promise: jest.fn().mockResolvedValue({
      write: 'ok'
    })
  });

  beforeEach(() => {
    instance = new UserPersistenceService();

    jest.spyOn(instance, 'ddb', 'get').mockReturnValue({
      scan: scanMock,
      get: getMock,
      put: putMock,
      query: queryMock,
      delete: jest.fn(),
      batchGet: jest.fn(),
      batchWrite: jest.fn(),
      createSet: jest.fn(),
      transactGet: jest.fn(),
      transactWrite: jest.fn(),
      update: jest.fn()
    });

  });

  it('can be instantiated', () => {

    expect(instance instanceof UserPersistenceService).toBeTruthy();
  });

  describe('#findAll', () => {

    it('should call scan', async () => {
      const resp = await instance.findAll();
      expect(instance.ddb.scan).toHaveBeenCalledWith({
        TableName: persistenceMetadata.tableName
      });

      expect(resp).toEqual([new User({
        id: 'id',
        name: 'name',
        email: 'email',
        role: 'role',
        password: 'password'
      })]);
    });
  });

  describe('#findOne', () => {

    it('should call get',  async () => {
      const resp = await instance.findOne({email: 'any-email'});
      expect(instance.ddb.query).toHaveBeenCalledWith({
        TableName: persistenceMetadata.tableName,
        KeyConditionExpression: '#email = :email_PlAcEhOlDeR',
        ExpressionAttributeNames: {
          '#email': 'email'
        },
        ExpressionAttributeValues: {
          ':email_PlAcEhOlDeR': 'any-email'
        }
      });

      expect(resp).toEqual(new User({
        id: 'id',
        name: 'name',
        email: 'email',
        role: 'role',
        password: 'password'
      }));
    });

    it('should throw an error in case of no document found', async() => {

      jest.spyOn(instance, 'ddb', 'get').mockReturnValue({
        query: jest.fn().mockReturnValue({
          promise: jest.fn().mockResolvedValue(undefined)
        }),
        delete: jest.fn(),
        batchGet: jest.fn(),
        batchWrite: jest.fn(),
        createSet: jest.fn(),
        transactGet: jest.fn(),
        transactWrite: jest.fn(),
        update: jest.fn(),
        get: jest.fn(),
        scan: jest.fn(),
        put: jest.fn()
      });

      try {
        await instance.findOne({email: 'any-email'});
      } catch (e) {
        expect(e.message).toEqual('document not found');
      }
    });
  });

  describe('#create', () => {
    it('should call put', async () => {
      const user = {
        name: 'name1',
        email: 'email1',
        role: 'role1',
        password: 'password1'
      };

      const user1 = new User(user);

      const result = await instance.create(user1);

      expect(instance.ddb.put).toHaveBeenCalledWith({
        Item: result,
        TableName: persistenceMetadata.tableName
      });
    });

  });

  describe('#getUpdateExpression', () => {
    it('should return an update expression given a Partial doc', () => {
      expect(instance['getUpdateExpression']({
        id: 'an-id',
        email: 'any-email'
      })).toEqual('SET #id = :id_PlAcEhOlDeR, #email = :email_PlAcEhOlDeR');

    });

  });

  describe('#getAttributeNames', () => {
    it('should return attribute names given a Partial doc', () => {
      expect(instance['getAttributeNames']({
        id: 'an-id',
        email: 'any-email'
      })).toEqual({
        '#email': 'email',
        '#id': 'id'
      });

    });

  });
  
  describe('#getAttributeValues', () => {
    it('should return an attributes values given a Partial doc', () => {
      expect(instance['getAttributeValues']({
        id: 'an-id',
        email: 'any-email'
      })).toEqual({
        ':email_PlAcEhOlDeR': 'any-email',
        ':id_PlAcEhOlDeR': 'an-id'
      });

    });

  });

});
