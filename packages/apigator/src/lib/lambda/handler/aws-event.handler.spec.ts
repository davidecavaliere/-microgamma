import { AwsEventHandler, LambdaDefaultHandler } from '@microgamma/apigator';

describe('AwsEventHandler', () => {

  let handler: LambdaDefaultHandler;

  beforeEach(() => {
    handler = new AwsEventHandler();
  });

  it('should get the body', () => {
    expect(handler.getBody([{ body: 'abc' }, null])).toEqual('abc');
  });

  it('should get path parameters', () => {
    expect(handler.getPathParams([{
      path: { a: 'b', c: 'd' }
    }])).toEqual({
      a: 'b',
      c: 'd'
    });

    expect(handler.getPathParams([{
      pathParameters: {
        ab: 'cd',
        ef: 'gh'
      }
    }])).toEqual({
      ab: 'cd',
      ef: 'gh'
    });

  });

  it('should get headerParams', () => {
    expect(handler.getHeaderParams([{
      headers: {
        a: 'v',
        c: 'w'
      }
    }])).toEqual({
      a: 'v',
      c: 'w'
    });

  });

  describe('#runOriginalFunction', () => {
    const instance = { my: 'instance' };

    it('should call res.json', async () => {
      const originalFn = jest.fn(() => {
        return 'my-value';
      });

      await handler.runOriginalFunction(originalFn, instance, ['new', 'args']);

      expect(originalFn).toHaveBeenCalledWith('new', 'args');

    });

  });

});
