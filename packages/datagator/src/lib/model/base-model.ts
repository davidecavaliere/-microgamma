import { getDebugger } from '@microgamma/loggator';
import { getColumnMetadata } from './column.decorator';
import { Model } from './base-model.types';

const d = getDebugger('microgamma:model');



export class BaseModel<T extends BaseModel<T>> {

  constructor(props: Model<T>) {

    d('this', this);
    d('Type of props', typeof props);

    Object.assign(this, props);

  }

  public get primaryKeyFieldName(): string {
    const colums = getColumnMetadata(this);

    let primaryKey;

    // tslint:disable-next-line:forin
    for (const field in colums) {
      const options = colums[field];
      if (options && options.primaryKey) {
        primaryKey = field;
      }
    }

    return primaryKey;
  }

  public get primaryKey(): string {
    return this[this.primaryKeyFieldName];
  }

  public set primaryKey(value) {
    this[this.primaryKeyFieldName] = value;
  }

  public toJSON():  Model<T> {
    const columns = getColumnMetadata(this);

    const publicObject = {};
    // tslint:disable-next-line:forin
    for (const field in columns) {
      const options = columns[field];

      d(`setting ${field}: ${this[field]},`, options);
      if (!options || (options && !options.private)) {
        publicObject[field] = this[field];
      }

    }

    return publicObject as Model<T>;
  }
}