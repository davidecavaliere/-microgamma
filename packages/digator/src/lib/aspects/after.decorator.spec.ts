// tslint:disable:no-expression-statement no-object-mutation

import { After } from './after.decorator';

describe('@After', () => {
  class TestClass {

    @After<string>((salutation) => {
      return salutation.toUpperCase();
    })
    public testA(name: string): string {
      return `Hello ${name}!`;
    }

    @After<string>((salutation) => {
      return salutation.toLowerCase();
    })
    public testB(name: string, nickname: string): string {
      return `Hello ${name} aka ${nickname}!`;
    }

  }

  let instance: TestClass;

  beforeEach(() => {
    instance = new TestClass();
  });

  it('should create a decorated class', () => {
    expect(instance).toBeTruthy();
  });

  it('should return a salutation', () => {
    expect(instance.testA('davide')).toEqual('HELLO DAVIDE!');
  });

  it('should work with tuples', () => {
    expect(instance.testB('davide', 'dave')).toEqual('hello davide aka dave!');
  })

});
