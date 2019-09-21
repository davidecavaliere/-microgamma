// tslint:disable:no-expression-statement no-object-mutation member-access max-classes-per-file
import { getDebugger } from '@microgamma/loggator';
import { BaseModel, Column } from '../model';
import { Persistence } from '../persistence';
import { DynamodbService } from './dynamodb.service';

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
        { name: 'name', email: 'email', role: 'role', password: 'password'}
      ]
    })
  });

  const getMock = jest.fn().mockReturnValue({
    promise: jest.fn().mockResolvedValue({
      name: 'name',
      email: 'email',
      role: 'role',
      password: 'password'
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
      put: putMock
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

      expect(resp).toEqual([{
        name: 'name',
        email: 'email',
        role: 'role'
      }]);
    });
  });

  describe('#findOne', () => {

    it('should call get',  async () => {
      const resp = await instance.findOne('id');
      expect(instance.ddb.get).toHaveBeenCalledWith({
        TableName: persistenceMetadata.tableName,
        Key: {
          HashKey: 'id'
        }
      });

      expect(resp).toEqual({
        name: 'name',
        email: 'email',
        role: 'role'
      });
    });

    it('should throw an error in case of no document found', async() => {

      jest.spyOn(instance, 'ddb', 'get').mockReturnValue({
        get: jest.fn().mockReturnValue({
          promise: jest.fn().mockResolvedValue(undefined)
        })
      });

      try {
        await instance.findOne('id');
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

});
