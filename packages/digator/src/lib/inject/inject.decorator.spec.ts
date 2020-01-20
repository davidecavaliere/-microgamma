// tslint:disable:no-expression-statement no-object-mutation max-classes-per-file


import { getDebugger } from '@microgamma/loggator';
import { Injectable, getInjectable, getSingletons, getSingleton, Inject, setInjectable } from '../';

const d = getDebugger('microgamma:inject.decorator.spec');


describe('@Inject', () => {

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

  it('should make injectables available for injection', () => {
    expect(getInjectable(TestClassA)).toEqual(TestClassA);
    expect(getInjectable(TestClassB)).toEqual(TestClassB);
  });

  it('injectables should not be instantiated yet', () => {
    expect(getSingletons()).toEqual({});
  });

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
      @Injectable()
      class TestClassToBeMocked {}

      class MockOfTestClassToBeMocked extends TestClassToBeMocked {}

      setInjectable({
        provide: TestClassToBeMocked,
        implementation: MockOfTestClassToBeMocked
      });

      expect(getSingleton(TestClassToBeMocked) instanceof MockOfTestClassToBeMocked).toBeTruthy();
    });

  });


});



