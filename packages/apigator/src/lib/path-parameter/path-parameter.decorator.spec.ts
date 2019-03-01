// tslint:disable:no-expression-statement no-object-mutation
import { getPathParameterMetadata, PathParameter } from './path-parameter.decorator';


class TestClass {
  public readonly toTestAccessToInstance: string = 'base';

  public findAll(@PathParameter() arg1, arg2, arg3) {
    return this.toTestAccessToInstance + arg1 + arg2 + arg3;
  }

}

describe('path parameter decorator', () => {
  let instance: TestClass;

  beforeEach(() => {
    instance = new TestClass();
  });


  it('should store some metadata', () => {
    expect(getPathParameterMetadata(instance, 'findAll')).toEqual([]);
  });

});
