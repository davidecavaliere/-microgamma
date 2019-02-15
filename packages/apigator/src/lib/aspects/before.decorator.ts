// tslint:disable:only-arrow-functions readonly-array prefer- no-if-statement no-object-mutation no-this

import 'reflect-metadata';
import { getArguments } from '../utils';
import { APIGatewayEvent } from 'aws-lambda';
import { getDebugger } from '@microgamma/loggator';

const d = getDebugger('microgamma:apigator:permission');

export const PermissionMetadata = Symbol('Permission');

export interface PermissionOptions {
  allow: (...args: any[]) => PromiseLike<any>;
}

export function Permission(options: PermissionOptions): MethodDecorator {


  return (target: any, key: string, descriptor: PropertyDescriptor) => {
    // d('target', target);
    // d('function name', key);

    Reflect.defineMetadata(PermissionMetadata, options, target);


    const originalMethod = descriptor.value;
    d('original method', originalMethod);

    const originalArguments = getArguments(originalMethod);
    d('original arguments', originalArguments);

    d('allow arguments are ', getArguments(options.allow));

    descriptor.value = async function() {
      // d('this is', this);
      d('arguments are', arguments);

      // running allow function
      const isAllowed = await options.allow.apply(this, arguments);

      if (isAllowed) {
        return originalMethod.apply(this, arguments);
      }

      throw new Error('method not allowed');

    };

    return descriptor;
  };
}

export function getPermissionMetadata(instance) {
  const metadata = Reflect.getMetadata(PermissionMetadata, instance);
  return metadata || {};
}

export function getPermissionMetadataFromClass(klass) {
  const metadata = Reflect.getMetadata(PermissionMetadata, klass.prototype);
  return metadata || {};
}
