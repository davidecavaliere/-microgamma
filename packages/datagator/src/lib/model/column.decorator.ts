import { getDebugger } from '@microgamma/loggator';

const d = getDebugger('microgamma:column:decorator');

export const ColumnMetadata = Symbol('Column');

export interface ColumnOptions {
  regex?: RegExp;
  private?: boolean;
  primaryKey?: boolean;
}

export function Column(options?: ColumnOptions): PropertyDecorator {

  return <TFunction extends Function>(target: TFunction, propertyKey: string) => {

    d('target', target);
    d('property key', propertyKey);
    d('typeof', typeof propertyKey);

    const columns = getColumnMetadata(target);

    columns[propertyKey] = options;

    Reflect.defineMetadata(ColumnMetadata, columns, target);
  };
}

export function getColumnMetadata(instance): { [k: string]: ColumnOptions } {
  const metadata = Reflect.getMetadata(ColumnMetadata, instance);
  return metadata || {};
}
