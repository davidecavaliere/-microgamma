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

export function getSingleton<T>(className): T {

  const name = typeof className === 'string' ? className : className.name;

  d('searching singleton for', className);
  d(className, 'has implementation?', singletons[name]);

  const implementation = getInjectable(className);

  if (!singletons[name]) {

    d('getting constructor');
    d( `${name} singleton not found. creating with`, implementation);
    singletons[name] = new implementation();

  } else {
    // hacking for when setInjectable gets called in the between
    // what's happening here is that singleton[name] has already be initialized with an older implementation
    // we want to provide an instance of the new implementation if it is the case

    const instanceAvailable = singletons[name];

    if (!(instanceAvailable instanceof implementation)) {
      singletons[name] = new implementation();
    }

  }

  return singletons[name];
}

export function getSingletons() {
  return singletons;
}

