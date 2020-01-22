// tslint:disable:no-expression-statement no-object-mutation
import { ServerlessApigator } from './serverless-apigator';
import { Authorizer, bootstrap, Endpoint, EndpointOptions, Lambda, LambdaOptions } from '@microgamma/apigator';
import { getDebugger } from '@microgamma/loggator';
import { Injectable } from '@microgamma/digator';
import { Options } from 'serverless';
import * as path from 'path';

const d = getDebugger('microgamma:serverless-apigator.spec');

describe('ServerlessApigator', () => {

  const serverless = {
    cli: {
      log: d
    },
    config: {
      servicePath: '/absolute/path/to/my-service',
    },
    service: {
      getServiceName: () => 'my-service',
      custom: {
        apigator: {
          entrypoint: 'my-entrypoint',
          buildFolder: 'lib'
        }
      },
      functions: {}
    },
    pluginManager: {
      cliCommands: []
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
  @Injectable()
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


  let plugin;

  let myModule;

  beforeEach(() => {
    myModule = bootstrap(TestClass);

    // tslint:disable-next-line:no-object-literal-type-assertion
    plugin = new ServerlessApigator(serverless, { stage: 'test' } as Options);

    spyOn(plugin, 'importModule').and.callFake(async () => {
      return { default: TestClass };

    });
  });

  it('should throw an error if buildFolder is missing in custom options', () => {

    expect(() => {
      // tslint:disable-next-line:no-unused-expression no-object-literal-type-assertion
      new ServerlessApigator({
        cli: {
          log: d
        },
        config: {
          servicePath: '/absolute/path/to/my-service',
        },
        service: {
          getServiceName: () => 'my-service',
          custom: {
          },
          functions: {}
        },
        pluginManager: {
          cliCommands: []
        }
        // tslint:disable-next-line:no-object-literal-type-assertion
      }, {stage: 'test'} as Options);
    }).toThrowError('buildFolder should not be empty');

  });

  it('serverless-apigator', () => {
    expect(plugin instanceof ServerlessApigator).toBeTruthy();
  });

  it('should set the servicePath', () => {
    expect(plugin.servicePath).toEqual(serverless.config.servicePath);
  });

  it('should set service name', () => {
    expect(plugin.serviceName).toEqual('my-service');
  });

  it('should set entry point path', () => {
    expect(plugin.entrypoint).toEqual('my-entrypoint');
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
      handler: 'lib/my-entrypoint.my-lambda',
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
        handler: 'lib/my-entrypoint.lambda-name-1',
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
        handler: 'lib/my-entrypoint.name',
        events: []
      });
      done();

    });

  });

  it('authorizer function should be configured', (done) => {
    return plugin.configureFunctions().then(() => {

      expect(serverless.service.functions['authorizer']).toEqual({
        name: 'my-service-test-authorizer',
        handler: 'lib/my-entrypoint.authorizer',
        events: []
      });
      done();
    });
  });

  describe('invoke:local hack', () => {

    // running yarn sls invoke -f functionName --stage dev will throw an error
    // because the hook 'before:invoke:local:loadEnvVars' will check for functionnName
    // before servelerss-apigator plugin is able to configure it.
    // To fix it we check if the command invoke local has been passed and then run the configuration
    // of the lambdas from the constructor

    const _serverless = {
      cli: {
        log: (message: string) => null
      },
      config: {
        servicePath: 'my-path',
      },
      // tslint:disable-next-line:no-object-literal-type-assertion
      service: {
        getServiceName: () => 'my-service',
        custom: {
          apigator: {
            entrypoint: 'my-entrypoint',
            buildFolder: 'lib'
          }
        },
        functions: {}
      },
      pluginManager: {
        cliCommands: ['invoke', 'local']
      }
    };

    let _plugin: ServerlessApigator;

    beforeEach(() => {
      spyOn(ServerlessApigator.prototype, 'importModule').and.callFake(async () => {
        return { default: TestClass };

      });

      // tslint:disable-next-line:no-object-literal-type-assertion
      _plugin = new ServerlessApigator(_serverless, { stage: 'dev'} as Options);

    });

    it('should have configured functions', () => {
      expect(_serverless.service.functions).toEqual({
        authorizer: {
          events: [],
          handler: 'lib/my-entrypoint.authorizer',
          name: 'my-service-dev-authorizer'
        },
        'lambda-name-1': {
          events: [{
            http: {
              cors: true,
              integration: 'lambda',
              method: 'get',
              path: '/',
              private: false
            }
          }],
          handler: 'lib/my-entrypoint.lambda-name-1',
          name: 'my-service-dev-lambda-name-1'
        },
        name: {
          events: [],
          handler: 'lib/my-entrypoint.name',
          name: 'my-service-dev-name'
        }
      });

    });

  });

  describe('hooks', () => {

    beforeEach(() => {
      spyOn(plugin, 'configureFunctions');
    });

    it('should configure functions before:package:initialize', () => {
      plugin.hooks['before:package:initialize']();
      expect(plugin.configureFunctions).toHaveBeenCalled();
    });
    
    it('should configure functions before:invoke:invoke', () => {
      plugin.hooks['before:invoke:invoke']();
      expect(plugin.configureFunctions).toHaveBeenCalled();
    });
    
    it('should configure functions offline:start:init', () => {
      plugin.hooks['offline:start:init']();
      expect(plugin.configureFunctions).toHaveBeenCalled();
    });

    it('should configure functions before:info:info', () => {
      plugin.hooks['before:info:info']();
      expect(plugin.configureFunctions).toHaveBeenCalled();
    });
  })
});


