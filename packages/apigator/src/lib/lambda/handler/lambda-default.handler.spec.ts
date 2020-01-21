import { LambdaDefaultHandler } from './';

describe('LambdaDefaultHandler', () => {

  let handler: LambdaDefaultHandler;

  beforeEach(() => {
    handler = new LambdaDefaultHandler();
  });

  it('should get the body', () => {
    expect(handler.getBody([{ body: 'abc' }, null])).toEqual([{ body: 'abc' }, null]);
  });

  it('should get path parameters', () => {
    expect(handler.getPathParams([{
      params: { a: 'b', c: 'd' }
    }])).toEqual([{
      params: { a: 'b', c: 'd' }
    }]);
  });

  it('should get headerParams', () => {
    expect(handler.getHeaderParams([{
      headers: {
        a: 'v',
        c: 'w'
      }
    }])).toEqual([{
      headers: {
        a: 'v',
        c: 'w'
      }
    }]);

  });

  describe('#runOriginalFunction', () => {
    let instance;
    const originalFn = jest.fn();

    beforeEach(() => {
      instance = { my: 'instance' };
    });


    it('should call original function', async () => {
      originalFn.mockResolvedValueOnce('my-value');

      await handler.runOriginalFunction(originalFn, instance, ['new', 'args'], ['original', 'args']);

      expect(originalFn).toHaveBeenCalledWith('original', 'args');

    });

    it('should catch any error', async () => {
      originalFn.mockImplementationOnce(() => {
        throw new Error('my-error');
      });


      try {
        await handler.runOriginalFunction(originalFn, instance, null, ['original', 'args']);
      } catch (e) {

        expect(originalFn).toHaveBeenCalledWith('original', 'args');
        expect(e.message).toEqual('[500] my-error');
      }




    });

    it('should map a give error such as "[404] error" to the status', async () => {
      originalFn.mockImplementationOnce(() => {
        throw new Error('[404] not found');
      });

      try {

        await handler.runOriginalFunction(originalFn, instance, null, ['original', 'args']);
      } catch (e) {

        expect(originalFn).toHaveBeenCalledWith('original', 'args');
        expect(e.message).toEqual('[404] not found');
      }

    });
  });

});
