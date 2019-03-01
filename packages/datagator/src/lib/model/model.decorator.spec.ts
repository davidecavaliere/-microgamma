// tslint:disable:no-expression-statement no-object-mutation
import { getModelMetadata, Model, ModelOptions } from '@microgamma/datagator';
import { getDebugger } from '@microgamma/loggator';

const d = getDebugger('microgamma:model.decorator.spec');

const options: ModelOptions = {
  name: 'modelFactory-name'
};

@Model(options)
class TestClass {

  constructor() {
    d('running original constructor');
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

