import { getDebugger } from '@microgamma/loggator';
import { SingletonDefinition, TestBedConfiguration } from './test-bed.types';
import { setImplementation } from '../';

const d = getDebugger('microgamma:test-bed');

export class TestBed {

  constructor(config: TestBedConfiguration) {
    d('creating testBed');

    config.providers.forEach((provider: SingletonDefinition) => {

      const provide = provider.provide;
      const useClass = provider.useClass;
      setImplementation({provide, implementation: useClass});
    });

  }

}
