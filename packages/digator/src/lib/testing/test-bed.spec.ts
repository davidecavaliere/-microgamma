// tslint:disable: max-classes-per-file
import { TestBed } from './test-bed';
import { getDebugger } from '@microgamma/loggator';
import { getInjectables, getSingleton, getSingletons } from '../';
import Test = jest.Test;

const d = getDebugger('microgamma:test-bed.spec');

describe('TestBed', () => {
  let testBed: TestBed;

  class TestClassA {
    constructor() {
      d('initing TestClassA');
    }
  }
  class TestClassB {
    constructor() {
      d('initing TestClassB');
    }
  }
  class MockImplementationTestClassB extends TestClassB {
    constructor() {
      super();
      d('initing Mocked Implementation');
    }
  }

  beforeEach(() => {
    testBed = new TestBed({
      providers: [
        {
          provide: TestClassB,
          useClass: MockImplementationTestClassB
        }
      ]
    });
  });

  it('should create', () => {
    expect(testBed).toBeTruthy();
  });

  it('should set the implementation provided', () => {
    const injectables = getInjectables();

    expect(injectables).toEqual({
      TestClassB: MockImplementationTestClassB
    });

  });

  it('should return the mocked implementation', () => {
    const singleton = getSingleton(TestClassB);

    expect(singleton instanceof MockImplementationTestClassB).toBeTruthy();

  });

  describe('a second TestBed which provides a different implementation is create', () => {

    class MockImplementationTestClassBSecond {}

    beforeEach(() => {
      // tslint:disable-next-line:no-unused-expression
      new TestBed({
        providers: [{
          provide: TestClassB,
          useClass: MockImplementationTestClassBSecond
        }]
      })

    });

    it('should provide the second implementation', () => {
      expect(getSingleton(TestClassB) instanceof MockImplementationTestClassBSecond).toBeTruthy();

    });
  });

});
