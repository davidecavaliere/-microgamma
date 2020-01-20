// tslint:disable:no-expression-statement no-object-mutation
import { Body, getBodyMetadata, getHeaderMetadata, getPathMetadata, Header, Path } from './parameters.decorator';

describe('@Path', () => {
  class TestClass {
    public readonly toTestAccessToInstance: string = 'base';

    public findAll(@Path('query') arg1, @Body() arg2, @Header('other') arg3) {
      return this.toTestAccessToInstance + arg1 + arg2 + arg3;
    }

    public findById(@Path('id') arg1, arg2, arg3) {
      return this.toTestAccessToInstance + arg1 + arg2 + arg3;
    }

    // public useDefaultNames(@Path() id, @Path() email) {
    //   return id + email;
    // }

  }

  let instance: TestClass;

  beforeEach(() => {
    instance = new TestClass();
  });


  it('should store some metadata', () => {
    expect(getPathMetadata(instance, 'findAll')).toEqual({
      query: 0
    });
    expect(getHeaderMetadata(instance, 'findAll')).toEqual({
      other: 2
    });
    expect(getBodyMetadata(instance, 'findAll')).toEqual({
      body: 1
    });
  });

  xit('should use varName when no value is passed', () => {
    expect(getPathMetadata(instance, 'useDefaultNames')).toEqual({
      id: 0,
      email: 1
    });


  });

});
