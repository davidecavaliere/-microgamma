// tslint:disable:no-expression-statement no-object-mutation
import { BaseModel } from './base-model';
import { Column } from './column.decorator';
import { SetOnlyType } from './base-model.types';

class MyModel extends BaseModel<MyModel> {

  @Column({
    primaryKey: true
  })
  public id?: string;

  @Column()
  public name: string;

  @Column({
    private: true
  })
  public hashedPassword?: string;

  public set password(value: SetOnlyType<string>) {
    this.hashedPassword = value.repeat(2);
  }

  public getId() {
    return this.id;
  }

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
      name: 'my-name',
      hashedPassword: 'passwordpassword'
    });

    expect(instance.password).toEqual(undefined);

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

