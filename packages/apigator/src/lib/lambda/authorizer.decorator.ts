// tslint:disable:only-arrow-functions readonly-array prefer- no-if-statement no-object-mutation no-this no-object-literal-type-assertion no-this-assignment

import 'reflect-metadata';
import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda';
import { getDebugger } from '@microgamma/loggator';
import { getSingleton } from '@microgamma/digator';

const d = getDebugger('microgamma:apigator:authorizer');

export const AuthorizerMetadata = Symbol('Authorizer');

export interface AuthorizerOptions {
  name: string;
}

export function Authorizer(options?: AuthorizerOptions) {
  d('constructing a class decorator', options);
  return (target: any, key: string, descriptor) => {
    d('target', target.constructor.name);
    d('function name', key);
    d('descriptor', descriptor);

    Reflect.defineMetadata(AuthorizerMetadata, {
      name: options ? options.name : key
    }, target);

    const originalFunction = descriptor.value;
    d('original function is', originalFunction.name);

    descriptor.value = async function () {
      const args = arguments;

      try {
        const instance = getSingleton(target.constructor);
        d('current instance is:', instance);

        d('original args are', args);

        const event: CustomAuthorizerEvent = args[0] as CustomAuthorizerEvent;

        d('authContext is', event);
        const newArgs = [event.authorizationToken, event.methodArn];

        const retValue = await originalFunction.apply(instance, newArgs);

        // authContext.requestContext.identity.user = retValue;

        // context.indentity = retValue;
        // d('setting identity', context.indentity);

        const statement = {
          Action: 'execute-api:Invoke',
          Effect: !!retValue ? 'Allow' : 'Deny',
          Resource: event.methodArn.split('/')[0] + '/*',
        };

        d('statement is', statement);

        const policy = {
          principalId: retValue,
          policyDocument: {
            Version: '2012-10-17',
            Statement: [
              statement
            ],
          },
          context: {
            user: retValue
          }

        } as CustomAuthorizerResult;

        d('returning policy', policy);

        return policy;
      } catch (e) {

        d('something is going on', e);

        if (e.message.match(/^\[[0-9]{3,}\](.)+/)) {
          throw Error(e);
        }

        throw Error(`[500] ${e}`);
      }
    };

    return descriptor;
  };
}

export function getAuthorizerMetadata(instance): AuthorizerOptions {
  d('metadata keys', Reflect.getMetadataKeys(instance));
  const metadata = Reflect.getMetadata(AuthorizerMetadata, instance);
  d('metadata', metadata);
  return metadata;
}

export function getAuthorizerMetadataFromClass(klass): AuthorizerOptions {
  d('metadata keys', Reflect.getMetadataKeys(klass.prototype));
  const metadata = Reflect.getMetadata(AuthorizerMetadata, klass.prototype);
  d('metadata', metadata);
  return metadata;
}
