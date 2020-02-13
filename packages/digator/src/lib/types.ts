// tslint:disable: no-mixed-interface

export interface ClassType<InstanceType extends {} = {}> extends Function {
  new(...args: any[]): InstanceType
  prototype: InstanceType
}

export type Provider<T> = {
  provide: ClassType<T>,
  useClass: ClassType<T>
} | ClassType<T>;

/**
 * Returns a function whose parameters are of type P or it does not have any and return R or void
 */
export type FunctionType<P, R> = (args: P | never) => R | void;
