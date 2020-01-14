// tslint:disable: no-mixed-interface

export interface ClassType<InstanceType extends {} = {}> extends Function {
  new(...args: any[]): InstanceType
  prototype: InstanceType
}

export type Provider<T> = {
  provide: ClassType<T>,
  useClass: ClassType<T>
} | ClassType<T>;
