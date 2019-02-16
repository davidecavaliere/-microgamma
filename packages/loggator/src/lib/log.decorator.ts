// tslint:disable: no-object-mutation no-string-literal no-parameter-reassignment

import debug, { IDebugger } from 'debug';
import 'reflect-metadata';


export const debuggerMetadata = Symbol('debug');
let namespace;
const d = debug;

export function Log(subspace?: string) {

  return (target, propertyKey) => {

    Reflect.defineMetadata(debuggerMetadata, subspace || target.constructor.name, target);


    target[propertyKey] = {
      // @ts-ignore
      d: (...args) => {

        subspace = subspace || target.constructor.name;

        // @ts-ignore
        const ns = namespace ? [namespace, subspace].join(':') : subspace;

        const loggerFn: IDebugger = getDebugger(ns);

        // @ts-ignore
        return loggerFn.apply(null, ...args);
      }
    };
  }
}

export function setNamespace(ns: string) {
  namespace = ns;
}

export function getDebugger(ns: string): IDebugger {
  const de = d(ns);
  de['useColors'] = true;
  return de;
}