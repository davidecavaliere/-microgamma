import { getDebugger } from '@microgamma/loggator';
import { getSingleton } from '../';
import { SingletonDefinition, TestBedConfiguration } from './test-bed.types';

const d = getDebugger('microgamma:test-bed');

export class TestBed {

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

    // const lamdbas: [] = Reflect.getMetadata(Symbol.for('Lambda'), this.service);
    // d('lambdas');
    // d(lamdbas);
    // lamdbas.forEach((lambda) => {
    //   const originalMethod = this.service[lambda['name']];
    //   spyOn(this.service, lambda['name']).and.callFake((...args) => {
    //     d('calling lambda', lambda);
    //     d('with', args);
    //     const lambdaArgs = [{
    //       body: {},
    //       path: {},
    //       headers: {}
    //     }, {
    //       requestContext: 'test'
    //     }, () => {
    //       // no empty
    //     }];
    //     originalMethod.apply(this.service, lambdaArgs);
    //   })
    // });
    //
    // Reflect.getMetadataKeys(config.service).forEach((key) => {
    //   d(key);
    //   d(Reflect.getMetadata(key, config.service));
    // });
    //
    // Object.keys(this.service).forEach((key) => {
    //   d('------');
    //   d(key);
    //   d('------');
    // });

    // const dependencyToMock = this.service[config.providers];
    // Object.values(dependencyToMock)
    //   // .filter((key) => typeof dependencyToMock[key] === 'function')
    //   .forEach((key) => {
    //     d('will mock');
    //     d(key);
    //
    //   });

  }

}