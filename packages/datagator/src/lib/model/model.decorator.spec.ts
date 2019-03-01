// tslint:disable:no-expression-statement no-object-mutation
import { getModelMetadata, Model, ModelOptions } from '@microgamma/datagator';

const options: ModelOptions = {
  name: 'modelFactory-name'
};

@Model(options)
class TestClass {

  constructor() {
    console.log('running original constructor');
  }
}

describe('@Model', () => {
  let instance: TestClass;

  beforeEach(() => {
    instance = new TestClass();


  });


  it('should store metadata', () => {


    expect(getModelMetadata(instance)).toEqual(options);

  });
});

