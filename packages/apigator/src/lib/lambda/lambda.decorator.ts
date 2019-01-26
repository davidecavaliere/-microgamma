// tslint:disable:only-arrow-functions readonly-array prefer- no-if-statement no-object-mutation no-this no-this-assignment

import 'reflect-metadata';
import { APIGatewayEvent } from 'aws-lambda';
import { getArguments } from '../utils';
import { getDebugger } from '@microgamma/loggator';
import { getSingleton } from '@microgamma/digator';

const d = getDebugger('microgamma:apigator:lambda');

export const LambdaMetadata = Symbol('Lambda');

export interface LambdaOptions {
  name?: string;
  path?: string;
  method?: string;
  integration?: string; // TODO Enum with all possible values of serverless integration;
  private?: boolean;
  cors?: boolean;
  authorizer?: string;
  description?: string;
}

function getApiGatewayEvent(args): APIGatewayEvent {
  // TODO add check
  return args[0];
}

function extractBody(args) {

  return getApiGatewayEvent(args).body;
}

function extractPathParams(args) {
  return getApiGatewayEvent(args).path;
}

function extractHeaderParams(args) {
  return getApiGatewayEvent(args).headers;
}

export function Lambda(options: LambdaOptions) {

  return (target: any, key: string, descriptor) => {
    d('target', target);
    d('function name', key);

    options.name = options.name || key;

    const lambdas = getLambdaMetadata(target).concat(options);
    // d('lambdas: ', lambdas);

    Reflect.defineMetadata(LambdaMetadata, lambdas, target);

    const originalFunction = descriptor.value;
    const functionArgumentsNames = getArguments(originalFunction);

    descriptor.value = async function () {
      const args = arguments;

      // here we have an array of string with names of arguments.
      /*
        i.e.: if function is defined such as:

        public function(id) {
        }

        then here we have ['id']

       */
      d('functionArgumentsNames ', functionArgumentsNames);


      /*
      here we have the real args the function has been called with
      i.e.: in case of aws lambda; respectively event, context, cb

      [
        { id: '5b798b78a56340b78834026f' },
        { awsRequestId: 'id',
          invokeid: 'id',
          logGroupName: '/aws/lambda/microgamma-user-service--findById',
          logStreamName: '2015/09/22/[HEAD]13370a84ca4ed8b77c427af260',
          functionVersion: 'HEAD',
          isDefaultFunctionVersion: true,
          functionName: 'microgamma-user-service--findById',
          memoryLimitInMB: '1024',
          succeed: [Function: succeed],
          fail: [Function: fail],
          done: [Function: done],
          getRemainingTimeInMillis: [Function: getRemainingTimeInMillis] },
        [Function: callback] ]

       */
      d('actual args are: ', args);

      const instance = getSingleton(target.constructor);
      d('current instance is:', instance);

      const methodMetadata = getLambdaMetadata(instance);
      d('method metadata', methodMetadata);


      const event: APIGatewayEvent = getApiGatewayEvent(args);

      d('request context is', event.requestContext);


      /*
          At this point args is an array
          I.E.:
           - if running on AWS lambda would be [event, context, cb]
          and so on
       */

      // extract body
      const body = extractBody(args);
      d('body is', body);

      // extract path params
      const pathParams = extractPathParams(args);
      d('path params are', pathParams);

      const headerParams = extractHeaderParams(args);
      d('header params are', headerParams);

      // extract query params
      // TBD

      // being able to alter the context
      // TBD

      // Make sure to add this so you can re-use `conn` between function calls.
      // See https://www.mongodb.com/blog/post/serverless-development-with-nodejs-aws-lambda-mongodb-atlas
      args[1].callbackWaitsForEmptyEventLoop = false;


      // here we need to extract the values we're expecting as arguments of our function from the real argument passed.
      const newArgs = functionArgumentsNames.map((arg) => {
        d('arg is', arg);
        if (arg === 'body') {
          return body;
        }

        if (arg === 'context') {
          return args[1];
        }

        if (arg === 'event') {
          return args[0];
        }

        return pathParams[arg] || body[arg] || headerParams[arg] || args[0][arg] || `argument ${arg} not found`;
      });
      d('mapped args are', newArgs);


      try {
        const retValue = await originalFunction.apply(instance, newArgs);

        d('retValue', retValue);

        return retValue;
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

export function getLambdaMetadata(instance) {
  const metadata = Reflect.getMetadata(LambdaMetadata, instance);
  return metadata ? [].concat(metadata) : [];
}

export function getLambdaMetadataFromClass(klass) {
  const metadata = Reflect.getMetadata(LambdaMetadata, klass.prototype);
  return metadata ? [].concat(metadata) : [];
}
