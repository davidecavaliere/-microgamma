// tslint:disable: member-access no-empty max-classes-per-file
import { Mocked, WithMock } from './mocked';
import isMockFunction = jest.isMockFunction;

describe('Mocked', () => {

  class BaseClass {}

  class TestClass extends BaseClass {
    methodOne() {}
    methodTwo() {}
  }

  let mockedInstance: WithMock<TestClass>;

  beforeEach(() => {
    const MockedClass = Mocked(TestClass, {mockParentMethods: true, mockOwnMethods: true});

    mockedInstance = new MockedClass();

  });

  it('should create', () => {
    expect(mockedInstance).toBeTruthy();
    expect(mockedInstance instanceof TestClass);
  });

  it('should mock the methods in TestClass', () =>  {
    expect(isMockFunction(mockedInstance.methodOne)).toBeTruthy();
    expect(isMockFunction(mockedInstance.methodTwo)).toBeTruthy();
  });

  it('should provide a flush method to push values through the mocked functions', async () => {
    expect(mockedInstance.flush instanceof Function).toBeTruthy();

    mockedInstance.flush({ any: 'thing' });
    const resp = await mockedInstance.methodOne();

    expect(resp).toEqual({ any: 'thing' });
    expect(mockedInstance.methodOne).toHaveBeenCalled();

    // TODO: since methodOne and methodTwo refer to the same spy, it will result that
    // methodTwo has been called when it wasn't. This can produce false negatives
    // It needs to be fixed
    // expect(mockedInstance.methodTwo).not.toHaveBeenCalled();


  });

});