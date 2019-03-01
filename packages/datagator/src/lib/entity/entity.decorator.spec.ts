// tslint:disable:no-expression-statement no-object-mutation
import { Entity, EntityOptions, getEntityMetadata } from './entity.decorator';
import { getDebugger } from '@microgamma/loggator';
import { Column, getColumnMetadata } from '../model/column.decorator';

const d = getDebugger('microgamma:entity.decorator.spec');

const options: EntityOptions = {
  name: 'entity-name',
  uri: 'mongodb-uri'
};


@Entity(options)
class TestClass {


  constructor() {
    d('running original constructor');
    d('running original constructor');
  }

  @Column()
  private name: string;

  @Column()
  private email: string;
}


describe('@Entity', () => {
  let instance: TestClass;

  beforeEach(() => {

    instance = new TestClass();

  });

  it('should create an instance', () => {
    expect(instance instanceof TestClass).toBeTruthy();

    expect(getColumnMetadata(instance)).toEqual({
      name: undefined,
      email: undefined
    });
  });

  it('should store some metadata', () => {
    expect(getEntityMetadata(instance)).toEqual(options);
  });

});
