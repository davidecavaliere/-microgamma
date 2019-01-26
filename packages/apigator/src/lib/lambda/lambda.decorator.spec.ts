// tslint:disable:no-expression-statement no-object-mutation
import test from 'ava';
import { getLambdaMetadata, getLambdaMetadataFromClass, Lambda, LambdaOptions } from './lambda.decorator';
import { Endpoint } from '../../';
import { bootstrap } from '../index';
import { Injectable } from '@microgamma/digator';

const option1: LambdaOptions = {
  method: 'get',
  name: 'lambda-name-1',
  path: '/'
};

const option2: LambdaOptions = {
  method: 'get',
  name: 'lambda-name-2',
  path: ':id'
};

@Endpoint({
  name: 'endpoint'
})
@Injectable()
class TestClass {

  public readonly toTestAccessToInstance: string = 'base';

  @Lambda(option1)
  public findAll(arg1, arg2, arg3) {
    // console.log('running original findAll()');
    return this.toTestAccessToInstance + arg1 + arg2 + arg3;
  }

  @Lambda(option2)
  public findOne() {
    return 1;
  }
}


describe('lambda.decorator', () => {
  let instance;

  beforeEach(() => {
    instance = new TestClass();

  });


  it('should store some metadata', () => {
    expect(getLambdaMetadata(instance)).toEqual([option1, option2]);
  });

  it('should get metadata from class', () => {
    expect(getLambdaMetadataFromClass(TestClass)).toEqual([option1, option2]);
  });

  it('findAll method should return 2: promised', async () => {

    const resp = await instance.findAll.apply(instance, [
      { // aws event
        path: {
          arg1: 1,
          arg2: 2,
          arg3: 3
        }
      },
      { context: 'a' } // context
    ]);

    expect(resp).toEqual('base123');

  });
});




