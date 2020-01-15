import { getDebugger } from '@microgamma/loggator';
import { SingletonDefinition, TestBedConfiguration } from './test-bed.types';
import { getSingleton } from '../';

const d = getDebugger('microgamma:test-bed');

export class TestBed {

  // private singletons = new Map<ClassType<any>, any>();

  constructor(config: TestBedConfiguration) {
    d('creating testBed');

    config.providers.forEach((provider: SingletonDefinition) => {

      if (provider instanceof Function) {
        getSingleton(provider);
      } else {
        const provide = provider.provide;
        const useClass = provider.useClass;
        getSingleton(provide, useClass);
      }
    });

  }
  //
  // private getSingleton<T>(provide: ClassType<T>, useClass = provide): T {
  //
  //   d('searching singleton for', provide);
  //
  //   if (!this.singletons.get(provide)) {
  //     this.singletons.set(provide, new useClass());
  //   }
  //
  //   return this.singletons.get(provide);
  // }
}