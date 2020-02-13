// tslint:disable:no-expression-statement no-object-mutation

import { getDebugger } from '@microgamma/loggator';
import { Before } from './before.decorator';

const d = getDebugger('microgamma:aspects:before:spec');

describe('before decorator', () => {

  interface Params {
    a: string;
    b: {
      c: string;
      d: number;
    },
    e: string[];
  }

  class TestClass {

    public static log = jasmine.createSpy('log');

    @Before<string>((name) => {
      return name.toUpperCase();
    })
    public async simpleParamSimpleType(name: string) {
      return `hello ${name}`;
    }

    @Before(TestClass.log)
    public simpleParamSimpleTypeVoidBefore(name: string) {
      return `hello ${name}`;
    }

    @Before<[Params, boolean]>((params) => {
      console.log('running before');
      return params;

    })
    public testInLineFunction({a, b}: Params, flag: boolean) {
      d({ a, b });
      return {
        a,
        ...b
      };
    }

    public changeCase(name: string) {
      return name.toUpperCase();
    }

    // tslint:disable-next-line:only-arrow-functions
    @Before<string>(function(name) {
      return this.changeCase(name);
    })
    public referringToThis(name: string) {
      return `Hello ${name}!`;
    }
  }


  let instance: TestClass;

  beforeEach(() => {
    instance = new TestClass();
  });

  it('should work with one param of simple type i.e.: string ', async () => {

    const retValue = await instance.simpleParamSimpleType('davide');

    expect(retValue).toEqual('hello DAVIDE');
  });

  it('should work with a void function', () => {
    expect(instance.simpleParamSimpleTypeVoidBefore('davide')).toEqual('hello davide');
    expect(TestClass.log).toHaveBeenCalled();

  });

  it('should be able to use inline functions', () => {
    expect(instance.testInLineFunction({
      a: 'test',
      b: {
        c: 'c',
        d: 122
      },
      e: ['test']
    }, false)).toEqual({
      a: 'test',
      c: 'c',
      d: 122
    });

  });

  it('should be able to refer to `this`', () => {
    expect(instance.referringToThis('davide')).toEqual('Hello DAVIDE!');

  });

});
