// tslint:disable: no-object-mutation no-if-statement readonly-array no-mixed-interface object-literal-shorthand only-arrow-functions

import { getDebugger } from '@microgamma/loggator';
import { getInjectable } from '../';

const d = getDebugger('microgamma:di:inject.decorator');

const singletons: { [className: string]: any } = {};


export function Inject(classDef): PropertyDecorator {
  return <TFunction extends Function>(target: TFunction, propertyKey) => {

    const klass = getInjectable(classDef);
    d({klass});

    // lazy injection of the singleton when it's needed
    Object.defineProperty(target, propertyKey, {
      get: () => {
        return getSingleton(klass);
      }
    });

  }
}

export function getSingleton<T>(className, implementation = null): T {

  const name = typeof className === 'string' ? className : className.name;

  d('searching singleton for', className);


  if (!singletons[name]) {
    d( `${name} singleton not found. creating....`);
    singletons[name] = implementation ? new implementation() : new className();
  }
  //
  return singletons[name];
}

export function getSingletons() {
  return singletons;
}

export function setImplementation({ provide, implementation }) {
  d('setting implementation');
  d({ provide });
  d({ implementation });

  const name = typeof provide === 'string' ? provide : provide.name;

  d('resetting implementation for', provide, 'with', implementation);

  singletons[name] = implementation;
}
