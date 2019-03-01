// tslint:disable:no-expression-statement no-object-mutation

import { ServerlessApigator } from './serverless-apigator';
import { Authorizer, bootstrap, Endpoint, EndpointOptions, Lambda, LambdaOptions } from '@microgamma/apigator';

const d = console.log;

const serverless = {
  cli: {
    log: console.log
  },
  config: {
    servicePath: 'my-path',
  },
  service: {
    service: 'my-service',
    custom: {
      entrypoint: 'my-entrypoint'
    },
    functions: {}
  }
};


const options: EndpointOptions = {
  name: 'endpoint-name'
};

const option1: LambdaOptions = {
  method: 'get',
  name: 'lambda-name-1',
  path: '/'
};

@Endpoint(options)
class TestClass {
  @Lambda(option1)
  public findAll(arg1, arg2, arg3) {
    return arg1 + arg2 + arg3;
  }

  @Lambda({
    name: 'name'
  })
  public functionA(arg1, arg2, arg3) {
    return arg1 + arg2 + arg3;
  }

  @Authorizer()
  public authorizer() {
    return true;
  }
}



describe('ServerlessApigator Plugin', () => {

  let plugin;

  let myModule;

  beforeEach(() => {
    myModule = bootstrap(TestClass);

    plugin = new ServerlessApigator(serverless, { stage: 'test' });

    spyOn(plugin, 'importModule').and.callFake(async () => {
      return { default: TestClass };

    });
  });

  it('serverless-apigator', () => {
    expect(plugin instanceof ServerlessApigator).toBeTruthy();
  });

  it('should set the servicePath', () => {
    expect(plugin.servicePath).toEqual(serverless.config.servicePath);
  });

  it('should set service name', () => {
    expect(plugin.serviceName).toEqual(serverless.service.service);
  });

  it('should set entry point path', () => {
    expect(plugin.entrypoint).toEqual(serverless.service.custom.entrypoint);
  });

  it('#addFunctionToService', () => {
    plugin.addFunctionToService({
      name: 'my-endpoint',
      basePath: 'root'
    }, {
      method: 'get',
      name: 'my-lambda',
      path: '/:id'
    });

    expect(serverless.service.functions['my-lambda']).toEqual({
      name: 'my-service-test-my-lambda',
      handler: 'my-entrypoint.my-lambda',
      events: [{
        http: {
          path: 'root/:id',
          method: 'get',
          integration: 'lambda',
          cors: true,
          private: false
        }
      }]
    });
  });

  it('#configureFunctions', (done) => {
    return plugin.configureFunctions().then(() => {

      d('here we have the functions');
      expect(serverless.service.functions['lambda-name-1']).toEqual({
        name: 'my-service-test-lambda-name-1',
        handler: 'my-entrypoint.lambda-name-1',
        events: [{
          http: {
            path: '/',
            method: 'get',
            integration: 'lambda',
            cors: true,
            private: false
          }
        }]
      });
      done();
    });

  });

  it('function with only name should have empty event array', (done) => {
    return plugin.configureFunctions().then(() => {

      expect(serverless.service.functions['name']).toEqual({
        name: 'my-service-test-name',
        handler: 'my-entrypoint.name',
        events: []
      });
      done();

    });

  });

  it('authorizer function should be configured', (done) => {
    return plugin.configureFunctions().then(() => {

      expect(serverless.service.functions['authorizer']).toEqual({
        name: 'my-service-test-authorizer',
        handler: 'my-entrypoint.authorizer',
        events: []
      });
      done();
    });
  });


});


