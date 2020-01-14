// tslint:disable: callable-types no-mixed-interface

export interface SingletonType<T = any> extends Function { new(...args: any[]): T; }

export interface SingletonWithImplementation {
  provide: SingletonType,
  useClass: SingletonType
}

export type SingletonDefinition =  SingletonWithImplementation | SingletonType;

export interface TestBedConfiguration {
  providers: SingletonDefinition[];
}

export interface ClassType<InstanceType extends {} = {}> extends Function {
  new(...args: any[]): InstanceType
  prototype: InstanceType
}

type Provider<T> = {
  provide: ClassType,
  useClass: ClassType
} | ClassType;

export interface TestBedOptions<T> {
  providers: Array<Provider<T>>;
}