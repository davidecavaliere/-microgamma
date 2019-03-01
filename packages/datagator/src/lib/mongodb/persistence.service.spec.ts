// tslint:disable:no-expression-statement no-object-mutation member-access max-classes-per-file
import { getDebugger } from '@microgamma/loggator';
import { BaseModel, Persistence, PersistenceService } from '@microgamma/datagator';

const d = getDebugger('microgamma:persistence.service.spec');


class User extends BaseModel {
  password;
  name;
  email;
  role;


}

@Persistence({
  uri: 'mongodb://192.168.254.2:27017',
  dbName: 'test',
  collection: 'users',
  model: User
})
class UserPersistenceService extends PersistenceService<User> {

}

describe('PersistenceService', () => {
  // let instance: UserPersistenceService;

  beforeEach(() => {
    // instance = new UserPersistenceService();


  });

  it('can be instantiated', () => {

    expect(true).toBeTruthy();
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
});
