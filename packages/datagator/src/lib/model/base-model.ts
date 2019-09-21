import { getDebugger } from '@microgamma/loggator';
import { getColumnMetadata } from './column.decorator';


const d = getDebugger('microgamma:model');

export class BaseModel {

  constructor(props: Partial<ThisType<BaseModel>>) {

    d('this', this);
    // d('T', T);

    Object.assign(this, props);

    const columns = getColumnMetadata(this);
    d('columns meta', columns);

    // tslint:disable-next-line:forin
    for (const field in columns) {
      const options = columns[field];

      if (options) {
        d(`setting ${field} enumerable ${!!options.private}`);
        Object.defineProperty(this, field, {
          enumerable: !options.private,
          writable: true
        })
      }
    }
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
}