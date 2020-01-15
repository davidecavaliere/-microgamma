// tslint:disable: no-mixed-interface
import Mock = jest.Mock;
import { getDebugger } from '@microgamma/loggator';

const d = getDebugger('microgamma:di:testing:mocked');

export interface ClassType<InstanceType extends {} = {}> extends Function {
  new(...args: any[]): InstanceType
  prototype: InstanceType
}

export const Mocked = <BaseClass extends ClassType<{}>, BaseInstance = InstanceType<BaseClass>>(base: BaseClass, mockOwnMethod = true): BaseClass =>

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
      this['tableName'] = 'test_table_name';

      d('mocking parents methods');
      this.mockClass(proto);

    }

    private mockClass(prototype): void {
      Object.getOwnPropertyNames(prototype)
        .filter((fn) => fn !== 'constructor')
        .forEach((fn) => {
          d('mocking', fn);
          prototype[fn] = this.mock
        });
    }
  };


export type WithMock<T> = T & {
  flush?: (value) => void;
  mock?: Mock<T>;
}
