// tslint:disable: callable-types

export interface SingletonType<T = any> extends Function { new(...args: any[]): T; }

export interface SingletonWithImplementation {
  provide: SingletonType,
  useClass: SingletonType
}

export type SingletonDefinition =  SingletonWithImplementation | SingletonType;

export interface TestBedConfiguration {
  providers: SingletonDefinition[];
}
