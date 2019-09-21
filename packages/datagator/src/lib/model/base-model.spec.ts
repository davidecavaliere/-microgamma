// tslint:disable:no-expression-statement no-object-mutation
import { BaseModel } from './base-model';
import { Column } from './column.decorator';

class MyModel extends BaseModel {

  @Column({
    primaryKey: true
  })
  public id: string;

  @Column()
  public name: string;

  @Column({
    private: true
  })
  public password: string;

}

describe('Model', () => {
  let instance: MyModel;


  beforeEach(() => {
    instance = new MyModel({
      name: 'my-name',
      password: 'password'
    });

  });



  it('should set fields', () => {

    // password field does not get serialized but it is still accessible

    expect(instance).toEqual({
      name: 'my-name'
    });

    expect(instance.password).toEqual('password');

  });

  it('should serialize to json', () => {


    expect(JSON.stringify(instance)).toEqual(JSON.stringify({
      name: 'my-name'
    }));
  });

  it('should return primary key if defined', () => {

    expect(instance.primaryKeyFieldName).toEqual('id');
  });

  it('should set primaryKey', () => {
    instance.primaryKey = 'abc';
    expect(instance.id).toEqual('abc');

    instance.id = 'bcd';
    expect(instance.id).toEqual('bcd');
  });

  it('should get primaryKey', () => {
    expect(instance.primaryKey).toBeUndefined();

    instance.id = 'bcd';
    expect(instance.primaryKey).toEqual('bcd');

    instance.primaryKey = 'xyz';
    expect(instance.primaryKey).toEqual('xyz');
  });

});

