// tslint:disable:no-expression-statement no-object-mutation
import { getDebugger } from '@microgamma/loggator';
import { getModelMetadata, Model, ModelOptions } from './model.decorator';

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

