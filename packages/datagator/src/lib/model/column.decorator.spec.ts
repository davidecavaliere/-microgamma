// tslint:disable:no-expression-statement no-object-mutation
import { Column, getColumnMetadata } from './column.decorator';
import { BaseModel } from './base-model';


type MyString = string;

class TestClass extends BaseModel {

  @Column()
  public name: MyString;

  @Column()
  public email: string;

  @Column({
    private: true
  })
  public password: string;
}

describe('@Column', () => {
  let instance: TestClass;

  beforeEach(() => {
    instance = new TestClass({
      name: 'a-name',
      email: 'an-email',
      password: 'a-password'
    });

  });

  it('should store metadata', () => {

    expect(getColumnMetadata(instance)).toEqual({
      email: undefined,
      name: undefined,
      password: {
        private: true
      }
    });
  });

  it('should serialize to json', () => {
    const json = instance.toJson();
    expect(json).toEqual({
      name: 'a-name',
      email: 'an-email'
    });
  });

  it('should add getter and setter', ()=> {
    instance.email = 'my-email';
    expect(instance.email).toEqual('my-email');
  });

});


