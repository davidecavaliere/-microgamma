import 'reflect-metadata';

const ServiceMetadata = 'Service';

export interface ServiceOptions {
  readonly name: string;
}

export function Service(options: ServiceOptions): ClassDecorator {
  // console.log('constructing a class decorator', options)
  return <TFunction extends Function>(target: TFunction) => {
    // console.log('decorating a class', target);
    Reflect.metadata(ServiceMetadata, options)(target);
  };
}

export function getServiceMetadata(instance) {
  return Reflect.getMetadata(ServiceMetadata, instance.constructor);
}
