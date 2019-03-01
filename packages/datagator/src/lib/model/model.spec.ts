// tslint:disable:no-expression-statement no-object-mutation
import { BaseModel } from './model';


class MyModel extends BaseModel {

  public name: string;

}

describe('Model', () => {
  let instance: MyModel;


  beforeEach(() => {
    instance = new MyModel({
      name: 'my-name'
    })
  });

  it('should set inner fields', () => {

    expect(instance).toEqual({
      name: 'my-name'
    });

  });

});

