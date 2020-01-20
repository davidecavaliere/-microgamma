// tslint:disable: no-object-mutation no-if-statement readonly-array no-mixed-interface
import 'reflect-metadata';
import { getDebugger } from '@microgamma/loggator';
import { ClassType } from '../types';

const d = getDebugger('microgamma:di:injectable');

const injectables: Map<string, ClassType> = new Map<string, ClassType>();

const InjectableMetadata = Symbol.for('Injectable');

export interface InjectableOptions {
  [k: string]: any
}

export function Injectable(options?: InjectableOptions) {

  return <TFunction extends ClassType>(target: TFunction) => {
    d('preparing', target.name, 'for injection');

    injectables.set(target.name, target);
    Reflect.metadata(InjectableMetadata, options)(target);
  };
}

export function getInjectableMetadata(instance) {
  return Reflect.getMetadata(InjectableMetadata, instance.constructor);
}

export function getInjectable(className: string | Function): ClassType {
  const name = className instanceof Function ? className.name : className;

  d('getting constructor for', name);
  if (!injectables.get(name)) {
    throw Error(`${name} is not available for injection. Did you forget to annotate it with @Injectable?`);
  }

  return injectables.get(name);
}

export function getInjectables() {
  const _injectables = {};
  injectables.forEach((value, key) => {
    _injectables[key] = value;
  });
  return _injectables;
}

export function setInjectable({ provide, implementation }) {
  d('setting implementation');
  d({ provide });
  d({ implementation });



  d('resetting implementation for', provide, 'with', implementation);

  injectables.set(provide.name, implementation);

}
