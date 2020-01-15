// tslint:disable: max-classes-per-file
import { TestBed } from './test-bed';
import { getDebugger } from '@microgamma/loggator';
import { getSingletons } from '../';

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
        TestClassA,
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
      TestClassA: expect.anything(),
      TestClassB: expect.anything()
    });
  });

  it('should have created an instance of the provided mock implementation', () => {
    const singletons = getSingletons();

    expect(singletons['TestClassB'] instanceof MockImplementationTestClassB).toBeTruthy();

  });

});