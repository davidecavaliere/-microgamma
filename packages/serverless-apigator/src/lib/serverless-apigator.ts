import { EndpointOptions, getAuthorizerMetadataFromClass, getEndpointMetadataFromClass, getLambdaMetadataFromClass, LambdaOptions } from '@microgamma/apigator';
import { getDebugger } from '@microgamma/loggator';
import * as path from 'path';
import * as Serverless from 'serverless';


const debug = getDebugger('microgamma:serverless-apigator');

/**
 *
 */
export interface ServerlessApigatorOptions {
  /**
   * @Deprecated
   */
  buildFolder: string;
  entrypoint: string;
  service: string;
}

export class ServerlessApigator {

  public hooks: any = {
    'before:package:initialize': () => {
      debug('before:package:initialize');
      return this.configureFunctions();
    },
    // 'before:invoke:local:loadEnvVars': () => {
    //   debug('before:invoke:local:loadEnvVars');
    //   // this hook is not useful see hack for invoke:local
    //   // return this.configureFunctions();
    // },
    'before:invoke:invoke': () => {
      debug('before:invoke');
      return this.configureFunctions();
    },
    // when this hook runs it already too late
    // 'before:invoke:local:invoke': () => {
    //   debug('before:invoke:local:invoke');
    //   // this hook is not useful see hack for invoke:local
    //   // return this.configureFunctions();
    // },
    // adding hook to make it work with serverless-offline plugin
    'offline:start:init': () => {
      debug('offline:init');
      return this.configureFunctions();
    },
    // adding hook to fix aws:info:display
    'before:info:info': () => {
      debug('offline:init');
      return this.configureFunctions();
    }
  };

  private readonly servicePath: string;
  private readonly entrypoint: string;
  private readonly serviceName: string;
  private readonly buildFolder: string;
  private readonly serviceClass: string;

  constructor(private serverless: any, private options: Serverless.Options) {

    this.options = options;
    const customOptions: ServerlessApigatorOptions = serverless.service.custom.apigator || {
      buildFolder: null,
      entrypoint: 'handler',
      service: ''
    };

    this.servicePath = serverless.config.servicePath;
    debug('servicePath:', this.servicePath);

    if (!customOptions.buildFolder) {
      throw new Error('buildFolder should not be empty');
    }

    this.buildFolder = customOptions.buildFolder;

    if (this.buildFolder.startsWith(this.servicePath)) {
      throw new Error('buildFolder should be a relative path such as is set in tsconfig.json `outDir`')
    }

    debug('build folder', this.buildFolder);

    // if (this.buildFolder) {
    //   // this.log('Option buildFolder is deprecated');
    // } else {
    //
    //   // TODO: we should allow comments in tsconfig. The below throws error because of them
    //   // we should read the file manually and parse the string before converting to json object.
    //   // when we can do that enable the warning above
    //   // const tsconfig = require(path.join(this.servicePath, 'tsconfig.json'));
    //   // debug({ tsconfig });
    //
    // }



    this.entrypoint = customOptions.entrypoint;

    debug('entrypoint', this.entrypoint);

    // if not specified assume will load index.js
    this.serviceClass = customOptions.service || '';

    this.serviceName = serverless.service.getServiceName();

    const [command, subCommand] = serverless.pluginManager.cliCommands;

    // hack to fix invoke:local hook
    if (command === 'invoke' && subCommand === 'local') {
      // hook does not work, sick!
      this.configureFunctions();
    }
  }

  public async configureFunctions() {

    const modulePath = path.join(this.servicePath, this.buildFolder, this.serviceClass);

    debug('importing service definition from', modulePath);

    const module = await this.importModule(modulePath);

    this.log('Injecting configuration');
    debug('module found', module);

    let endpoint;

    if (module.default) {
      endpoint = module.default;
    } else {
      // service definition does not export as default.
      // there should only one service defined
      const keys = Object.keys(module);
      debug({ keys });

      if (keys.length !== 1) {
        throw new Error('Service file should export only one element');
      }

      endpoint = module[keys[0]];
    }

    const endpointMetadata: EndpointOptions = getEndpointMetadataFromClass(endpoint);
    debug('Endpoint', endpointMetadata);

    const lambdas = getLambdaMetadataFromClass(endpoint);
    debug('Lambdas', lambdas);

    const authorizerFn = getAuthorizerMetadataFromClass(endpoint);

    this.log('Parsing Apigator Service definitions');

    if (authorizerFn) {
      debug('auth function found', authorizerFn);
      this.log('Setting up custom authorizer');
      this.addFunctionToService(endpointMetadata, authorizerFn);

    }

    for (const lambda of lambdas) {
      debug('configuring lambda', lambda);

      this.addFunctionToService(endpointMetadata, lambda);

    }

    debug({ functions: this.serverless.service.functions });

    this.log(`${lambdas.length} functions configured`);
  }


  public async importModule(_path: string) {
    return import(_path);
  }

  public addFunctionToService(endpoint: EndpointOptions, lambda: LambdaOptions) {
    const functionName = lambda.name;

    const basePath = endpoint.basePath || '';

    const fullFunctionName = `${this.serviceName}-${this.options.stage || ''}-${functionName}`;

    // cors true by default
    let corsOption = true;

    if (lambda.hasOwnProperty('cors')) {
      corsOption = lambda.cors;
    } else if (endpoint.hasOwnProperty('cors')) {
      corsOption = endpoint.cors;
    }

    const privateLambda = lambda.hasOwnProperty('private') ? !!lambda.private: !!endpoint.private;

    const url = basePath + lambda.path;
    const method = lambda.method;
    const authorizer = lambda.hasOwnProperty('authorizer') ? lambda.authorizer : null;

    const httpEvent: LambdaOptions & { integration: string } = {
      integration: lambda.integration || 'lambda',
      cors: corsOption,
      private: privateLambda
    };

    if (lambda.path) {
      httpEvent.path = url;
    }

    if (method) {
      httpEvent.method = method;
    }

    if (authorizer) {
      httpEvent.authorizer = authorizer;
    }

    const entrypoint = path.join(this.buildFolder, this.entrypoint);

    const lambdaDef = {
      name: fullFunctionName,
      handler: `${entrypoint}.${functionName}`
    };

    if (lambda.path) {
      lambdaDef['events'] = [{
        http:  httpEvent
      }]
    } else {
      lambdaDef['events'] = [];
    }

    this.serverless.service['functions'][lambda.name] = lambdaDef;

    // this.serverless.service.setFunctionNames({ [lambda.name]: lambdaDef });

    debug('function configured', this.serverless.service['functions'][lambda.name]);

  }

  private log(message) {
    this.serverless.cli.log(`Apigator: ${message}`);
  }


}
