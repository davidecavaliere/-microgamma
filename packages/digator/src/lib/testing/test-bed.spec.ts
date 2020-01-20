// tslint:disable: max-classes-per-file
import { TestBed } from './test-bed';
import { getDebugger } from '@microgamma/loggator';
import { getSingleton, getSingletons } from '../';

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

  it('should have instantiated the services defined in the providers array', () => {
    expect(getSingletons()).toEqual({
      TestClassB: expect.anything()
    });
  });

  it('should have created an instance of the provided mock implementation', () => {
    const singletons = getSingletons();

    expect(singletons['TestClassB']).toEqual(MockImplementationTestClassB);

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
      expect(getSingleton(TestClassB)).toEqual(MockImplementationTestClassBSecond);

    });
  });

});
