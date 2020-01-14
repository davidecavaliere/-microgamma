import { DI } from './di.decorator';

describe.only('@DI', () => {

  let app;

  @DI({
    providers: ['A', 'B', 'C']
  })
  class App {}


  beforeEach(() => {
    app = new App();
  });


  it('should create', () => {
    expect(app).toBeTruthy();
  });


});