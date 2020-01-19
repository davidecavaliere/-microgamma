// tslint:disable:only-arrow-functions readonly-array prefer- no-if-statement no-object-mutation no-this no-this-assignment no-shadowed-variable

import 'reflect-metadata';
import { APIGatewayEvent } from 'aws-lambda';
import { getArguments } from '../utils';
import { getDebugger } from '@microgamma/loggator';
import { getSingleton } from '@microgamma/digator';
import { getBodyMetadata, getHeaderMetadata, getPathMetadata } from '../parameters/parameters.decorator';
import { AwsEventHandler } from './handler/aws-event-handler';

const d = getDebugger('microgamma:apigator:lambda');

type Parameters<T> = T extends (... args: infer T) => any ? T : never;
type ReturnType<T> = T extends (... args: any[]) => infer T ? T : never;

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

  // serverless-apigator sets integration = 'lambda' if integration is not define
  options.integration = options.integration || 'lambda';

  return (target: any, key: string, descriptor) => {
    const handler: AwsEventHandler = getSingleton(AwsEventHandler);
    d({ handler });
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


      // const event: APIGatewayEvent = handler.getApiGatewayEvent(args);
      //
      // d('event is', event);


      /*
          At this point args is an array
          I.E.:
           - if running on AWS lambda would be [event, context, cb]
          and so on
       */

      // extract body
      const bodyParams = getBodyMetadata(instance, key);
      d('@BodyParams', bodyParams);

      const body = handler.getBody(args);
      d('body is', body);

      // extract path params
      const pathAnnotatedParams = getPathMetadata(instance, key);
      d('@PathParams', pathAnnotatedParams);

      const pathParams = handler.getPathParams(args);
      d('path params are', pathParams);

      // extract header params
      const headerAnnotatedParams = getHeaderMetadata(instance, key);
      d('@HeaderParams', headerAnnotatedParams);


      const headerParams = handler.getHeaderParams(args);
      d('header params are', headerParams);

      // extract query params
      // TBD

      // being able to alter the context
      // TBD

      // Make sure to add this so you can re-use `conn` between function calls.
      // See https://www.mongodb.com/blog/post/serverless-development-with-nodejs-aws-lambda-mongodb-atlas
      args[1].callbackWaitsForEmptyEventLoop = false;

      const newArgs = new Array(functionArgumentsNames.length);
      d('annotated new args', newArgs);

      // TODO: refactor here and decide what to do when a param cannot be found where is expected
      Object.keys(pathAnnotatedParams).forEach((param) => {
        d('scanning', param);
        const index = pathAnnotatedParams[param];
        d('with index', index);
        newArgs[index] = pathParams[param];

      });

      Object.keys(bodyParams).forEach((param) => {
        d('scanning', param);
        const index = bodyParams[param];
        d('with index', index);
        newArgs[index] = body;

      });

      Object.keys(headerAnnotatedParams).forEach((param) => {
        d('scanning', param);
        const index = headerAnnotatedParams[param];
        d('with index', index);
        newArgs[index] = headerParams[param];

      });

      d('annotatoed args are', newArgs);


      try {
        const retValue = await originalFunction.apply(instance, newArgs);

        d('retValue', retValue);

        return retValue;
      } catch (e) {

        d('something is going on', e);

        if (e instanceof Error) {
          if (e.message.match(/^\[[0-9]{3,}\](.)+/)) {
            throw e;
          } else {
            throw Error(`[500] ${e.message}`);
          }

        }

        // encapsulate any other type of error
        throw Error(e);

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
