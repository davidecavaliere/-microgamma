// tslint:disable:only-arrow-functions readonly-array prefer- no-if-statement no-object-mutation no-this no-this-assignment no-shadowed-variable

import 'reflect-metadata';
import { getArguments } from '../utils';
import { getDebugger } from '@microgamma/loggator';
import { getSingleton } from '@microgamma/digator';
import { getBodyMetadata, getHeaderMetadata, getPathMetadata } from '../parameters/parameters.decorator';
import { LambdaDefaultHandler } from './handler';

const d = getDebugger('microgamma:apigator:lambda');

export const LambdaMetadata = Symbol.for('Lambda');

export interface LambdaOptions {
  name?: string;
  path?: string;
  method?: string;
  integration?: string; // TODO Enum with all possible values of serverless integration;
  private?: boolean;
  cors?: boolean;
  authorizer?: string | {};
  description?: string;
}


export function Lambda(options: LambdaOptions) {

  // serverless-apigator sets integration = 'lambda' if integration is not defined
  options.integration = options.integration || 'lambda';

  return (target: any, key: string, descriptor) => {

    options.name = options.name || key;

    const lambdas = getLambdaMetadata(target).concat(options);

    Reflect.defineMetadata(LambdaMetadata, lambdas, target);

    const originalFunction = descriptor.value;

    descriptor.value = async function () {
      const functionArgumentsNames = getArguments(originalFunction);

      const handler: LambdaDefaultHandler = getSingleton(LambdaDefaultHandler);

      const args = arguments;

      // here we have an array of string with names of arguments.
      /*
        i.e.: if function is defined such as:

        public function(id) {
        }

        then here we have ['id']

       */
      d({ functionArgumentsNames });


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

      const instance = getSingleton(target.constructor);
      d({instance});

      const methodMetadata = getLambdaMetadata(instance);
      d({methodMetadata});

      /*
          At this point args is an array
          I.E.:
           - if running on AWS lambda would be [event, context, cb]
          and so on
       */

      // extract body
      const bodyParams = getBodyMetadata(instance, key);
      d({bodyParams});

      const body = handler.getBody(args);
      d({body});

      // extract path params
      const pathAnnotatedParams = getPathMetadata(instance, key);
      d({pathAnnotatedParams});

      const pathParams = handler.getPathParams(args);
      d({pathParams});

      // extract header params
      const headerAnnotatedParams = getHeaderMetadata(instance, key);
      d({headerAnnotatedParams});


      const headerParams = handler.getHeaderParams(args);
      d({headerParams});

      // TODO: extract query params

      // TODO: being able to alter the context or pass context to originalFunction

      // Make sure to add this so you can re-use `conn` between function calls.
      // See https://www.mongodb.com/blog/post/serverless-development-with-nodejs-aws-lambda-mongodb-atlas
      if (args[1] && args[1].hasOwnProperty('callbackWaitsForEmptyEventLoop')) {
        args[1].callbackWaitsForEmptyEventLoop = false;
      }

      const newArgs = new Array(functionArgumentsNames.length);

      // TODO: refactor here and decide what to do when a param cannot be found where is expected

      Object.keys(pathAnnotatedParams).forEach((param) => {
        const index = pathAnnotatedParams[param];
        newArgs[index] = pathParams[param];
      });

      Object.keys(bodyParams).forEach((param) => {
        const index = bodyParams[param];
        newArgs[index] = body;
      });

      Object.keys(headerAnnotatedParams).forEach((param) => {
        const index = headerAnnotatedParams[param];
        newArgs[index] = headerParams[param];
      });

      d({newArgs});

      return handler.runOriginalFunction(originalFunction, instance, newArgs, args);

    };

    return descriptor;
  }

}

export function getLambdaMetadata(instance) {
  const metadata = Reflect.getMetadata(LambdaMetadata, instance);
  return metadata ? [].concat(metadata) : [];
}

export function getLambdaMetadataFromClass(klass) {
  const metadata = Reflect.getMetadata(LambdaMetadata, klass.prototype);
  return metadata ? [].concat(metadata) : [];
}
