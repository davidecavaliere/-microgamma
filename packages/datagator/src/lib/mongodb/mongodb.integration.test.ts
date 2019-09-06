// tslint:disable:max-classes-per-file
import { MongoMemoryServer } from 'mongodb-memory-server';
import { BaseModel, Column } from '../model';
import { Persistence } from '../persistence';
import { MongodbService } from './mongodb.service';
import { getDebugger } from '@microgamma/loggator';

const d = getDebugger('microgamma:datagator:mongodb.integration');



describe('mongodb integration test', () => {


  class GroupModel extends BaseModel {

    @Column()
    public _id: string;

    @Column()
    public name: string;

    @Column()
    public users: string[];

    @Column()
    public owner: string;

  }


  @Persistence({
    uri: 'mongodb://localhost:27017/test',
    dbName: 'test',
    collection: 'groups',
    model: GroupModel
  })
  class GroupPersistence extends MongodbService<GroupModel> {

    public async findByOwner(ownerId) {
      return super.findAll({owner: ownerId});
    }

    public async findByMember(userId) {
      return super.findAll({users: userId});
    }
  }


  let instance;

  beforeEach(() => {
    instance = new GroupPersistence();
  });

  it('should create an instance of the Service', () => {
    expect(instance).toBeTruthy();
  });

  it('should throw an error if cannot connect', async () => {
    try {
      const list = await instance.findAll();

    } catch (e) {
      expect(e.toString()).toContain('MongoNetworkError');
    }


  });

  describe('read-write-read-delete-read', () => {

    let mongod;

    beforeAll(async (done) => {

      mongod = new MongoMemoryServer({
        instance: {
          dbName: 'test',
          port: 27017
        }
      });

      const connection = await mongod.getConnectionString();
      d('connection', connection);

      done();
    });

    it('should return empty array', async () => {
      const docs = await instance.findAll();

      expect(docs).toEqual([]);
    });

    it('should create a group', async () => {

      const group = {
        name: 'group1',
        owner: 'owner1',
        users: ['user1', 'user2']
      };

      const resp = await instance.create(group);

      expect(resp.toString()).toContain(JSON.stringify({
        n: 1,
        ok: 1
      }));
    });

    it('should delete a group', async () => {
      const docs = await instance.findAll();

      expect(docs.length).toEqual(1);

      docs.forEach(async (doc) => {
        await instance.delete(doc._id);
      });

      const afterDeletion = await instance.findAll();
      expect(afterDeletion.length).toEqual(0);


    });

    afterAll(async (done) => {
      d('cleaning up');
      await mongod.stop();
      d('server stopped');
      done();
    });
  });

  // describe('get by id', () => {
  //
  // })
});
