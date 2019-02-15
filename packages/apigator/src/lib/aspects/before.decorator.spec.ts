// tslint:disable:no-expression-statement no-object-mutation
import { Permission, PermissionOptions } from './permission.decorator';

const option1: PermissionOptions = {
  allow: async (arg1, arg2, arg3) => {
    console.log('checking permission', arg1, arg2, arg3);
    return true;
  }
};

class TestClass {
  public readonly toTestAccessToInstance: string = 'base';

  @Permission(option1)
  public async findAll(arg1, arg2, arg3) {
    // console.log('running original findAll()');
    return this.toTestAccessToInstance + arg1 + arg2 + arg3;
  }

  // @Permission(option2)
  // public async findOne() {
  //   return 1;
  // }
}


describe('permission decorator', () => {
  let instance: TestClass;

  beforeEach(() => {
    instance = new TestClass();
  });

  it('findAll method should return 2: promised', async () => {

    const retValue = await instance.findAll.apply(instance, [1, 2, 3]);

    expect(retValue).toEqual('base123');
  });


});
//
// test('should allow execution of annotated method if some condition is met',  async (t) => {
//
//   t.is(await instance.findOne(), 1);
//
// });
//
// test('should not allow execution of annotated method if some condition is not met', async (t) => {
//
//   const error = await t.throws(instance.findAll('a', 'b', 'c'));
//
//   t.deepEqual(error, Error('Error: [405] method not allowed'));
//
// });


// test('should store some metadata', t => {
//
//   t.deepEqual(getPermissionMetadata(instance), [option1, option2]);
//
// });
//
// test('should get metadata from class', (t) => {
//
//   t.deepEqual(getPermissionMetadataFromClass(TestClass), [option1, option2]);
//
// });
