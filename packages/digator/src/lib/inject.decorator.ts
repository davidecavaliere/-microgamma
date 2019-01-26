// tslint:disable: no-object-mutation no-if-statement readonly-array no-mixed-interface object-literal-shorthand only-arrow-functions

import { Constructor, getInjectable, getInjectables } from './';
import { getDebugger } from '@microgamma/loggator';

const d = getDebugger('microgamma:di:inject');

const singletons: { [className: string]: any } = {};


export function Inject(classDef): PropertyDecorator {
  return <TFunction extends Function>(target: TFunction, propertyKey) => {

    // lazy injection of the singleton when it's needed
    Object.defineProperty(target, propertyKey, {
      get: () => {

        return getSingleton(classDef);
      }
    });

  }
}

export function getSingleton(className) {

  const name = typeof className === 'string' ? className : className.name;

  d('searching singleton for', className);


  if (!singletons[className.name]) {
    d( `${className.name} singleton not found. creating....`);
    singletons[className.name] = new className();
  }
  //
  return singletons[className.name];
}

export function getSingletons() {
  return singletons;
}