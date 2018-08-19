// tslint:disable:no-expression-statement no-object-mutation
import test from 'ava';
import {
  getServiceMetadata,
  Service,
  ServiceOptions
} from './service.decorator';
import {
  Log,
  setNamespace
} from '@microgamma/ts-debug/build/main/lib/log.decorator';

const options: ServiceOptions = {
  name: 'service-name'
};

setNamespace('lambda');

@Service(options)
class TestClass {
  @Log() public $l;

  constructor() {
    this.$l.d('instantiating', this.constructor.name);
  }
}

let instance: TestClass;

test.beforeEach(() => {
  instance = new TestClass();
});

test('service decorator', t => {
  // console.log('instance', instance);
  t.is(instance instanceof TestClass, true);
});

test('should store some metadata', t => {
  t.is(getServiceMetadata(instance), options);
});