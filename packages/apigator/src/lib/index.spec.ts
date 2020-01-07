// tslint:disable:no-expression-statement no-object-mutation


import { bootstrap, Endpoint, Lambda } from '../';
import { Injectable } from '@microgamma/digator';



@Endpoint({
  name: 'test-service'
})
@Injectable()
class TestClass {
  @Lambda({
    method: 'get',
    name: 'manifest',
    path: '/'
  })
  public manifest() {
    return 'this is the manifest';
  }
}

describe('bootstrap', () => {

  let inst;

  beforeEach(() => {
    inst = bootstrap(TestClass);
  });

  it('should bootstrap application', () => {

    expect(inst instanceof TestClass).toBeTruthy();
  });
});

