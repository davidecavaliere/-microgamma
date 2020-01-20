// tslint:disable:only-arrow-functions readonly-array prefer- no-if-statement no-object-mutation no-this

import 'reflect-metadata';
import { getDebugger } from '@microgamma/loggator';

const d = getDebugger('microgamma:apigator:parameter');

export const PathParameterMetadata = Symbol.for('Path');
export const HeaderParameterMetadata = Symbol.for('Header');
export const BodyParameterMetadata = Symbol.for('Body');

export type PathParameterOptions = string;

export function Path(options: PathParameterOptions): ParameterDecorator {
  d('constructing path parameter with options:', options);
  return (target: any, key: string, index) => {
    d('target', target);
    d('key', key);
    d('index', index);

    const stored = getPathMetadata(target, key);
    d('stored metadata', stored);

    // TODO: check for key already exists
    // TODO: allow optional options and get path part name from function (target[key]) signature
    stored[options] = index;

    Reflect.defineMetadata(PathParameterMetadata, stored, target, key);
  };
}

export function getPathMetadata(instance, key) {
  const metadata = Reflect.getMetadata(PathParameterMetadata, instance, key);
  d('metadata', metadata);
  return metadata || {};
}

export function Header(options: string): ParameterDecorator {
  d('constructing Header parameter with options:', options);
  return (target: any, key: string, index) => {
    d('target', target);
    d('key', key);
    d('index', index);

    const stored = getHeaderMetadata(target, key);
    d('stored metadata', stored);

    // TODO: check for key already exists
    stored[options] = index;

    Reflect.defineMetadata(HeaderParameterMetadata, stored, target, key);
  };
}

export function getHeaderMetadata(instance, key) {
  const metadata = Reflect.getMetadata(HeaderParameterMetadata, instance, key);
  d('metadata', metadata);
  return metadata || {};
}

export function Body(): ParameterDecorator {
  d('constructing Body parameter with options:');
  return (target: any, key: string, index) => {
    d('target', target);
    d('key', key);
    d('index', index);

    const stored = getBodyMetadata(target, key);
    d('stored metadata', stored);

    // TODO: check for key already exists
    stored['body'] = index;

    Reflect.defineMetadata(BodyParameterMetadata, stored, target, key);
  };
}

export function getBodyMetadata(instance, key) {
  const metadata = Reflect.getMetadata(BodyParameterMetadata, instance, key);
  d('metadata', metadata);
  return metadata || {};
}
