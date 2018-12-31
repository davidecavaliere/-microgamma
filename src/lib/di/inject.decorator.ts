// tslint:disable: no-object-mutation no-if-statement readonly-array no-mixed-interface

import { getInjectable } from './injectable.decorator';
import { getDebugger } from '@microgamma/ts-debug/build/main/lib/log.decorator';

const d = getDebugger('microgamma:di:inject');

const singletons: { [className: string]: any } = {};


export function Inject(classDef): PropertyDecorator {
  return <TFunction extends Function>(target: TFunction, propertyKey) => {

    d('injecting on', target, classDef.name);


    d('typeof', propertyKey);
    d(classDef);
    const constructor = getInjectable(classDef);
    d('got constructor', constructor.name);

    if (!singletons[constructor.name]) {
      d('singleton not found. creating....');
      singletons[constructor.name] = new constructor();
    }

    target[propertyKey] = singletons[constructor.name];

  }
}