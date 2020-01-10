// tslint:disable:no-expression-statement no-object-mutation max-classes-per-file


import { getInjectable, getSingleton, getSingletons, Inject, Injectable } from './';
import { getDebugger } from '@microgamma/loggator';

const d = getDebugger('microgamma:inject:decorator:spec');

@Injectable()
class TestClassA {
  constructor() {
    d('this is the constructor of TestClassA');
  }

  public sayHello(className: string) {
    d(`Hello from A to ${className}`);
  }
}
@Injectable()
class TestClassB {
  constructor() {
    d('this is the constructor of TestClassB');
  }

  public sayHello(className: string) {
    d(`Hello from B to ${className}`);
  }
}

class Consumer {

  @Inject(TestClassA)
  public testClassA;

  @Inject(TestClassA)
  public testClassA2: TestClassA;

  @Inject(TestClassB)
  public testClassB: TestClassB;

  constructor() {
    d('this is the constructor of Consumer');
    this.testClassA.sayHello('consumer');
    this.testClassB.sayHello('Consumer');
  }

}

describe('@Injectable', () => {


  it('should make injectables avaible for injection', () => {
    expect(getInjectable(TestClassA)).toEqual(TestClassA);
    expect(getInjectable(TestClassB)).toEqual(TestClassB);
  });

  it('injectables should not be instantiated yet', () => {
    expect(getSingletons()).toEqual({});
  });

});



describe('inject decorator', () => {


  it('if consumer is not instantiated injectable should be neither', () => {
    expect(getSingletons()).toEqual({});

  });

  it('should instantiate injectables after consumer class is instantiated', () => {
    expect(getInjectable(TestClassA)).toBeDefined();
    const consumer = new Consumer();
    expect(consumer.testClassA instanceof TestClassA).toBeTruthy();

  });

  describe('getSingleton', () => {

    it('should instantiate a singleton if does not exist yet', () => {
      expect(getSingleton(TestClassA) instanceof TestClassA).toBeTruthy();
    });

    it('should instantiate a singleton with the given implementation', () => {
      class TestClassToBeMocked {}
      class MockOfTestClassToBeMocked extends TestClassToBeMocked {}

      expect(getSingleton(TestClassToBeMocked, MockOfTestClassToBeMocked) instanceof MockOfTestClassToBeMocked).toBeTruthy();
    });
  });

});



