
import { MongodbService } from './mongodb.service';
import { getDebugger } from '@microgamma/loggator';
import { BaseModel, Column, Persistence } from '@microgamma/datagator';

const d = getDebugger('microgamma:datagator:mongodb.integration');


d('mongodb', process.env.MONGO_URL);

fdescribe('mongodb integration test', () => {


  class GroupModel extends BaseModel<GroupModel> {

    @Column({
      primaryKey: true
    })
    public id: string;

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

    let mongoServer;

    beforeAll(async () => {
      // d('starting mongo');
      // mongoServer = new MongoMemoryServer({
      //   debug: true,
      //   instance: {
      //     port: 27017
      //   }
      //
      // });
      // const mongoUri = await mongoServer.getConnectionString();
      // d('mongoUri', mongoUri);
    });

    afterAll(async () => {
      await mongoServer.stop();
      d('mongo stopped');
      d('-------------------------------------------------------');
      d('-------------------------------------------------------');
      d('-------------------------------------------------------');
      d('-------------------------------------------------------');
      d('-------------------------------------------------------');
      d('-------------------------------------------------------');
      d('-------------------------------------------------------');
      d('-------------------------------------------------------');
      d('-------------------------------------------------------');
      d('-------------------------------------------------------');
      d('-------------------------------------------------------');
      d('-------------------------------------------------------');
      d('-------------------------------------------------------');
      d('-------------------------------------------------------');
      d('-------------------------------------------------------');
      d('-------------------------------------------------------');
      d('-------------------------------------------------------');
      d('-------------------------------------------------------');
      d('-------------------------------------------------------');
      d('-------------------------------------------------------');
      d('-------------------------------------------------------');
      d('-------------------------------------------------------');
      d('-------------------------------------------------------');
      d('-------------------------------------------------------');
      d('-------------------------------------------------------');
      d('-------------------------------------------------------');
      d('-------------------------------------------------------');

    });

    it('should return empty array', async () => {
      d('getting items');
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

  });


});
