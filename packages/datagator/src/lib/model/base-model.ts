import { getDebugger } from '@microgamma/loggator';
import { getColumnMetadata } from './column.decorator';


const d = getDebugger('microgamma:model');

export class BaseModel {

  constructor(props: Partial<ThisType<BaseModel>>) {

    d('this', this);
    d('Type of props', typeof props);

    Object.assign(this, props);

  }

  public get primaryKeyFieldName() {
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

  public get primaryKey() {
    return this[this.primaryKeyFieldName];
  }

  public set primaryKey(value) {
    this[this.primaryKeyFieldName] = value;
  }

  public toJSON() {
    const columns = getColumnMetadata(this);

    const retvalue: Partial<ThisType<this>> = {};
    // tslint:disable-next-line:forin
    for (const field in columns) {
      const options = columns[field];

      d(`setting ${field}: ${this[field]},`, options);
      if (!options || (options && !options.private)) {
        retvalue[field] = this[field];
      }

    }

    return retvalue;
  }
}