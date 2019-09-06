import { getColumnMetadata } from './column.decorator';
import { getDebugger } from '@microgamma/loggator';

const d = getDebugger('microgamma:model');

export class BaseModel {

  public id?;
  public _id?;

  constructor(arg) {
    Object.assign(this, arg);
  }

  public toJson?(): any {
    const columns = getColumnMetadata(this);
    d('columns meta', columns);

    const json = {};

    for (const key in columns) {
      if (!(columns[key] && columns[key]['private'])) {
        json[key] = this[key];
      }
    }

    return json;
  }

}