import { getDebugger } from '@microgamma/loggator';

const d = getDebugger('microgamma:persistence:decorator');

const PersistenceMetadata = Symbol.for('Persistence');

export interface PersistenceServiceOptions {
  options?: any;
  model: any;
}

export function Persistence<T extends PersistenceServiceOptions>(options: T): ClassDecorator {

  return <TFunction extends Function>(target: TFunction) => {

    d('target', target.name);
    d('options', options);

    Reflect.metadata(PersistenceMetadata, options)(target);
    d('metadata stored', Reflect.getMetadata(PersistenceMetadata, target));
  };
}

export function getPersistenceMetadata<T extends PersistenceServiceOptions>(instance): T {
  const metadata = Reflect.getMetadata(PersistenceMetadata, instance.constructor);
  d('getting persistence metadata', metadata);
  return metadata;
}
