// tslint:disable:no-expression-statement no-object-mutation
import { Column, getColumnMetadata } from './column.decorator';
import { BaseModel } from './base-model';


type MyString = string;

class TestClass extends BaseModel<TestClass> {

  @Column()
  public name: MyString;

  @Column()
  public email: string;

  @Column({
    private: true
  })
  public hashedPassword: string;

  public set password(password) {
    this.hashedPassword = password.repeat(2);
  }
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
      hashedPassword: {
        private: true
      }
    });
  });

});


