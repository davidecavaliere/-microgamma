import 'reflect-metadata';
import { LambdaHandler } from '../lambda/handler/lambda-handler';
import { AwsEventHandler } from '../lambda/handler/aws-event-handler';
import { setInjectable } from '@microgamma/digator';

const EndpointMetadata = Symbol.for('Endpoint');

export interface EndpointOptions {
  readonly name: string;
  readonly basePath?: string;
  readonly private?: boolean;
  readonly cors?: boolean;
  readonly providers?: Array<{provide: any, implementation: any}>;
}

export function Endpoint(options: EndpointOptions): ClassDecorator {
  // Set default Handlers, if user provides a different implementation it will overwritten below
  // defaults to AwsLambdaHandler

  if (options.providers) {
    options.providers.forEach(setInjectable);
  } else {
    setInjectable({
      provide: LambdaHandler,
      implementation: AwsEventHandler
    });
  }

  return <TFunction extends Function>(target: TFunction) => {

    Reflect.metadata(EndpointMetadata, options)(target);
  };
}

export function getEndpointMetadata(instance) {
  return Reflect.getMetadata(EndpointMetadata, instance.constructor);
}

export function getEndpointMetadataFromClass(klass) {
  return Reflect.getMetadata(EndpointMetadata, klass);
}

