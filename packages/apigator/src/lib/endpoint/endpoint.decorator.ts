import 'reflect-metadata';
import { setImplementation } from '@microgamma/digator';
import { LambdaHandler } from '../lambda/handler/lambda-handler';
import { AwsEventHandler } from '../lambda/handler/aws-event-handler';

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
  setImplementation({
    provide: LambdaHandler,
    implementation: AwsEventHandler
  });

  if (options.providers) {
    options.providers.forEach(setImplementation);
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

