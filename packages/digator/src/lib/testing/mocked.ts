// tslint:disable: no-mixed-interface
import Mock = jest.Mock;
import { getDebugger } from '@microgamma/loggator';

const d = getDebugger('microgamma:di:testing:mocked');

export interface ClassType<InstanceType extends {} = {}> extends Function {
  new(...args: any[]): InstanceType
  prototype: InstanceType
}

export interface MockedOptions {
  mockOwnMethods: boolean;
  mockParentMethods: boolean;
}

export const Mocked = <BaseClass extends ClassType<{}>, BaseInstance = InstanceType<BaseClass>>(base: BaseClass, {
  mockOwnMethods, mockParentMethods
}: MockedOptions = { mockOwnMethods: true, mockParentMethods: false}): BaseClass =>

  class extends base {


    public flush(value: any) {
      this.mock.mockResolvedValueOnce(value);
    };

    public mock = jest.fn();

    constructor(...ops: any[]) {
      super();
      d('constructing mock');

      this.mockClass(base.prototype);

      const proto = Object.getPrototypeOf(base.prototype);
      // this['tableName'] = 'test_table_name';


      // TODO: see if there is a way to check wether base is a "primitive" class or not
      if (mockParentMethods) {
        d('mocking parents methods');
        this.mockClass(proto);
      }

    }

    private mockClass(prototype): void {
      Object.getOwnPropertyNames(prototype)
        .filter((fn) => fn !== 'constructor')
        .forEach((fn) => {
          d('mocking', fn);
          // BE AWARE: if TestClass does not extends any other class then trying to do the below
          // will throw an error because prototype of primitive object "{}" cannot be set!

          prototype[fn] = this.mock

        });
    }
  };


export type WithMock<T> = T & {
  flush?: (value) => void;
  mock?: Mock<T>;
}
