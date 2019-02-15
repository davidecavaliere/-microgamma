// tslint:disable:no-expression-statement no-object-mutation

import { getDebugger } from '@microgamma/loggator';

const d = getDebugger('microgamma:aspects:before:spec');

import { Before } from './before.decorator';

class TestClass {

  @Before(TestClass.beforeFindAll)
  public async findAll(arg1, arg2, arg3) {
    d('running findAll()');
    d('arguments are', arg1, arg2, arg3);
    return arg1 + 'a' + arg2 + 'b' + arg3 + 'c';
  }

  public static async beforeFindAll(arg1, arg2, arg3) {

    d('running beforeFindAll()');
    d('arguments are', arg1, arg2, arg3);
    return ['a' + arg1, 'b' + arg2, 'c' + arg3];
  }

}


describe('before decorator', () => {
  let instance: TestClass;

  beforeEach(() => {
    instance = new TestClass();
    spyOn(instance, 'findAll').and.callThrough();
  });

  it('findAll method should ', async () => {

    const retValue = await instance.findAll.apply(instance, [1, 2, 3]);

    // apparently the spy still sees the function to be called with the original
    // arguments!
    expect(instance.findAll).toHaveBeenCalledWith(1, 2, 3);

    expect(retValue).toEqual('a1ab2bc3c');
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
//   t.deepEqual(getBeforeMetadata(instance), [option1, option2]);
//
// });
//
// test('should get metadata from class', (t) => {
//
//   t.deepEqual(getBeforeMetadataFromClass(TestClass), [option1, option2]);
//
// });
