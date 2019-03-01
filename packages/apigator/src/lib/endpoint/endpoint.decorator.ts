import 'reflect-metadata';

const EndpointMetadata = Symbol('Endpoint');

export interface EndpointOptions {
  readonly name: string;
  readonly basePath?: string;
  readonly private?: boolean;
  readonly cors?: boolean;
}

export function Endpoint(options: EndpointOptions): ClassDecorator {

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

