import { getDebugger } from '@microgamma/loggator';
import { MongoClientOptions } from 'mongodb';

const d = getDebugger('microgamma:persistence:decorator');

const PersistenceMetadata = Symbol('Persistence');

export interface PersistenceServiceOptions {
  collection: string;
  uri: string;
  dbName: string;
  options?: MongoClientOptions;
  model: any;
}

export function Persistence(options: PersistenceServiceOptions): ClassDecorator {

  return <TFunction extends Function>(target: TFunction) => {

    d('target', target.name);
    d('options', options);

    Reflect.metadata(PersistenceMetadata, options)(target);
    d('metadata stored', Reflect.getMetadata(PersistenceMetadata, target));
  };
}

export function getPersistenceMetadata(instance): PersistenceServiceOptions {
  const metadata = Reflect.getMetadata(PersistenceMetadata, instance.constructor);
  d('getting persistence metadata', metadata);
  return metadata;
}
