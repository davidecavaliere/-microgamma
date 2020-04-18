// tslint:disable:no-expression-statement, max-classes-per-file
import { Log, Logger, setNamespace } from './log.decorator';


setNamespace('myNamespace');

class TestClass {

  @Log()
  private $l: Logger;

  constructor() {
    // this.$l.d('constructing', this);
  }
}
let instance: TestClass;

setNamespace('ns2');

class TestClassNS2 {

  @Log()
  private $l;

  constructor() {
    this.$l.d('test 2nd ns');
  }
}

let instance2: TestClassNS2;

setNamespace('ns3');

class TestClassNS3 {
  @Log()
  private $l;

  constructor() {
    this.$l.d('test 3nd ns');
  }

  public logAnObject() {
    return this.$l.d('this is an object', { a: 'a', b: 'b' });
  }
}

describe('@Log', () => {

  let instance3: TestClassNS3;

  beforeEach(() => {
    instance = new TestClass();
    instance2 = new TestClassNS2();
    instance3 = new TestClassNS3();
  });

  it('log decorator', () => {
    expect(instance).toBeTruthy();
    expect(instance2).toBeTruthy();
    expect(instance3).toBeTruthy();

  });

});
