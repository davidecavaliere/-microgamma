// tslint:disable:no-empty
import { Body, EndpointMock, Header, Lambda, Path } from '@microgamma/apigator';

describe('EndpointMock', () => {

  let mockedClass;
  let instance: TestClass;

  class TestClass {
    @Lambda({})
    public index(@Path('test') test, @Body() body, @Header('test') headerTest) {
      return [test, body, headerTest].join('-');
    }

    @Lambda({})
    public post() {
      return 'nothing';
    }

    @Lambda({})
    public create(@Body() body, @Header('principalId') owner) {
      return {
        ...body,
        owner
      }
    }
    }



  beforeEach(() => {
    mockedClass = EndpointMock(TestClass);

    instance = new mockedClass;
  });

  it('should return the same class', () => {
    expect(mockedClass).toEqual(TestClass);
  });

  describe('spy on lambdas', () => {
    it('should spy on any lambda defined', async () => {

      const index = await instance.index('test', 'body', 'headerTest');
      expect(instance.index).toHaveBeenCalledWith('test', 'body', 'headerTest');
      expect(index).toEqual('test-body-headerTest');
      const post = await instance.post();
      expect(instance.post).toHaveBeenCalled();
      expect(post).toEqual('nothing');

      const resp = await instance.create({
        name: 'a-name',
        users: []
      }, 'owner-id');

      expect(resp).toEqual({
        name: 'a-name',
        users: [],
        owner: 'owner-id'
      });
    });

  });


});