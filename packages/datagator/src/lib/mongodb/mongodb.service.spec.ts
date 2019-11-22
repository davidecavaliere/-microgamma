// tslint:disable:no-expression-statement no-object-mutation member-access max-classes-per-file
import { getDebugger } from '@microgamma/loggator';
import { MongoClient, ObjectID } from 'mongodb';
import { BaseModel, Column } from '../model';
import { Persistence } from '../persistence';
import { MongodbService } from './mongodb.service';

const d = getDebugger('microgamma:persistence.service.spec');


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
  uri: 'mongodb://192.168.254.2:27017',
  dbName: 'test',
  collection: 'users',
  model: User,
  options: {}
};

@Persistence(persistenceMetadata)
class UserPersistenceService extends MongodbService<User> {}

describe('MongodbService', () => {
  let instance: UserPersistenceService;

  beforeEach(() => {
    instance = new UserPersistenceService();

    // mock mongodb
    spyOn(MongoClient, 'connect').and.returnValue({
      db: jasmine.createSpy('db').and.returnValue({
        collection: jasmine.createSpy('collection')
      })
    });

  });

  it('can be instantiated', () => {

    expect(instance).toBeTruthy();
    // d('instance', instance);
    // expect(instance instanceof UserPersistenceService).toBeTruthy();
    // return instance.getClient().then((client) => {
    //   expect(client.isConnected()).toBeTruthy();
    //
    //   instance.findAll().then((docs) => {
    //     d('docs found', docs);
    //     expect(docs).toBeTruthy();
    //   });
    // }).catch((err) => {
    //   expect(err).toBeFalsy();
    // });

  });

  it('should return an instance of User when provided a json object', () => {
    const user = instance['modelFactory']({
      password: 'password',
      name: 'name',
      email: 'email',
      role: 'role'
    });

    expect(user instanceof User).toBeTruthy();
  });

  describe('#getClient', () => {

    it('should connect to mongodb', async () => {
      const client = await instance.getClient();

      expect(MongoClient.connect).toHaveBeenCalledWith(persistenceMetadata.uri, {
        ...persistenceMetadata.options,
        useNewUrlParser: true
      });
      expect(client.db).toHaveBeenCalledWith(persistenceMetadata.dbName);
      expect(client.db()['collection']).toHaveBeenCalledWith(persistenceMetadata.collection);
      expect(client).toBeTruthy();

    });
  });

  describe('#getCollection', () => {
    it('should return a mongodb collection', async () => {
      const client = await instance.getClient();
      await instance.getCollection();

      expect(client.db()['collection']).toHaveBeenCalledWith(persistenceMetadata.collection)

    });
  });

  describe('CRUD operations', () => {

    let collection;

    beforeEach(async () => {
      // mock getCollection

      spyOn(instance, 'getCollection').and.returnValue({
        find: jasmine.createSpy('find').and.returnValue({
          toArray: jasmine.createSpy('toArray').and.returnValue([])
        }),
        findOne: jasmine.createSpy('findOne').and.returnValue({
          id: 'anything',
          password: 'password',
          name: 'name',
          email: 'email',
          role: 'role'
        })
      });

      collection = await instance.getCollection();
    });

    describe('#findAll', () => {


      it('should call find', async () => {
        await instance.findAll();

        expect(collection.find).toHaveBeenCalledWith(undefined);

      });
    });

    describe('#findOne', () => {

      it('should find a user by id', async () => {
        const _id = '507f1f77bcf86cd799439011';
        const resp = await instance.findOne(_id);

        d('resp', resp);
        
        expect(resp).toEqual(new User({
            id: expect.anything(),
            name: 'name',
            email: 'email',
            role: 'role',
            password: 'password'
          })
        );
        expect(collection.findOne).toHaveBeenCalledWith({
          _id: new ObjectID(_id)
        });

      });

    })
  });

});
