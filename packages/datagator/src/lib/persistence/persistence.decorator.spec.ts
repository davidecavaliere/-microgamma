// tslint:disable:no-expression-statement no-object-mutation member-access max-classes-per-file
import { MongodbService } from '../mongodb';
import { BaseModel } from '../model';
import { getPersistenceMetadata, Persistence } from './persistence.decorator';

class User extends BaseModel<User> {
  password;
  name;
  email;
  role;
}

const metadata =  {
  uri: 'mongodb://192.168.254.2:27017',
  dbName: 'test',
  collection: 'users',
  model: User
};

@Persistence(metadata)
class UserPersistenceService extends MongodbService<User> {}

describe('@Persistence', () => {
  let instance: UserPersistenceService;

  beforeEach(() => {

    instance = new UserPersistenceService();

  });

  it('should store metadata', () => {
    expect(getPersistenceMetadata(instance)).toEqual(metadata);
  })

});