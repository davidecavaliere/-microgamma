// tslint:disable: max-classes-per-file
import { MongodbService } from './mongodb.service';
import { getDebugger } from '@microgamma/loggator';
import { BaseModel, Column, Persistence } from '@microgamma/datagator';

const d = getDebugger('microgamma:datagator:mongodb.integration');


d('mongodb', process.env.MONGO_URL);

describe('mongodb integration test', () => {


  class GroupModel extends BaseModel<GroupModel> {

    @Column({
      primaryKey: true
    })
    public _id: string;

    @Column()
    public name: string;

    @Column()
    public users: string[];

    @Column()
    public owner: string;

  }


  @Persistence({
    uri:  process.env.MONGO_URL,
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

  describe('read-write-read-delete-read', () => {

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

      expect(resp).toEqual({
        _id: expect.anything(),
        ...group
      });
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
