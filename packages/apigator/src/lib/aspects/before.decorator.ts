// tslint:disable:only-arrow-functions readonly-array prefer- no-if-statement no-object-mutation no-this no-empty-interface

import 'reflect-metadata';
import { getDebugger } from '@microgamma/loggator';

const d = getDebugger('microgamma:aspects:before');

export const BeforeMetadataSymbol = Symbol('Before');

export type BeforeFn = (...args: any[]) => Promise<any>;

export function Before(beforeFn: BeforeFn): MethodDecorator {

  return (target: any, key: string, descriptor: PropertyDescriptor) => {
    // d('target', target);
    // d('function name', key);

    Reflect.defineMetadata(BeforeMetadataSymbol, beforeFn, target);

    d('beforeFn', beforeFn);

    const originalMethod = descriptor.value;
    d('original method', originalMethod);


    descriptor.value = async function() {
      // d('this is', this);
      d('arguments are', arguments);

      // running allow function
      // Q: retValue should same as input to avoid confusion?
      try {

        const retValue = await beforeFn.apply(this, arguments);


        d('retValue is', retValue);

        // so here we can call originalMethod with retValue
        // doing so beforeFn has the ability to change original arguments's values

        d('calling original method');
        return originalMethod.apply(this, retValue);

      } catch (e) {

        throw e;

      }

    };

    return descriptor;
  };
}

export function getBeforeMetadata(instance) {
  const metadata = Reflect.getMetadata(BeforeMetadataSymbol, instance);
  return metadata || {};
}

export function getBeforeMetadataFromClass(klass) {
  const metadata = Reflect.getMetadata(BeforeMetadataSymbol, klass.prototype);
  return metadata || {};
}
