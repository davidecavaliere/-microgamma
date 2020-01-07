import { Brand, Diff, Omit, ValuesType } from 'utility-types';
import { BaseModel } from '@microgamma/datagator';

export type SetOnlyType<T> = Brand<T, 'SET_ONLY'>;

declare type SetOnlyProperties<T> = {
  [P in keyof T]-?: T[P] extends SetOnlyType<T[P]> ? P : never
}[keyof T]

declare type FunctionKeysOfModel<T> = {
  [P in keyof T]-?: T[P] extends Function ? P : never
}[keyof T]

export type OmitBaseComponents<T extends BaseModel<T>> = Diff<T, BaseModel<T>>;
export type OmitFunctionKeys<T extends object> = Omit<T, FunctionKeysOfModel<T>>;
export type OmitSetOnlyFields<T extends object> = Omit<T, SetOnlyProperties<T>>;

export type ExtractRealTypeFromSetOnly<T extends Object> = {
  [P in keyof T]: T[P] extends SetOnlyType<T[P]> ? ValuesType<T[P]> : never;
}

export type OptionalSetOnlyProperties<T extends object> = Partial<Pick<T, SetOnlyProperties<T>>>;

export type ModelType<T extends BaseModel<T>> = OmitSetOnlyFields<OmitFunctionKeys<OmitBaseComponents<T>>> & ExtractRealTypeFromSetOnly<OptionalSetOnlyProperties<T>>;

