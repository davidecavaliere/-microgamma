// tslint:disable: no-object-mutation no-if-statement readonly-array no-mixed-interface
import 'reflect-metadata';
import { getDebugger } from '@microgamma/loggator';

const d = getDebugger('microgamma:di:injectable');

export type Constructor = new (...args: string[]) => any;

const injectables: { [className: string]: Constructor } = {};

const InjectableMetadata = Symbol.for('Injectable');

export interface InjectableOptions {
  [k: string]: any
}

export function Injectable(options?: InjectableOptions) {

  return <TFunction extends Constructor>(target: TFunction) => {
    d('preparing', target.name, 'for injection');

    injectables[target.name] = target;
    Reflect.metadata(InjectableMetadata, options)(target);
  };
}



export function getInjectableMetadata(instance) {
  return Reflect.getMetadata(InjectableMetadata, instance.constructor);
}

export function getInjectable(className: string | Function): Constructor {
  const name = className instanceof Function ? className.name : className;

  d('getting constructor for', name);
  if (!injectables[name]) {
    throw Error(`${name} is not available for injection. Did you forget to annotate it with @Injectable?`);
  }

  return injectables[name];
}

export function getInjectables() {
  return injectables;
}

