// tslint:disable:no-empty
import { Body, EndpointMock, Header, Lambda, Path } from '@microgamma/apigator';

describe('EndpointMock', () => {

  let mockedClass;
  let instance: TestClass;

  class TestClass {
    @Lambda({})
    public index(@Path('test') test, @Body() body, @Header('test') headerTest) {}

    @Lambda({})
    public post() {}
  }



  beforeEach(() => {
    mockedClass = EndpointMock(TestClass);

    instance = new mockedClass;
  });

  it('should return the same class', () => {
    expect(mockedClass).toEqual(TestClass);
  });

  describe('spy on lambdas', () => {
    it('should spy on any lambda defined', () => {

      instance.index('test', 'body', 'headerTest');
      expect(instance.index).toHaveBeenCalledWith('test', 'body', 'headerTest');
      instance.post();
      expect(instance.post).toHaveBeenCalled();
    });

  });


});