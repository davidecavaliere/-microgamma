import { EndpointOptions, getAuthorizerMetadataFromClass, getEndpointMetadataFromClass, getLambdaMetadataFromClass, LambdaOptions } from '@microgamma/apigator';
import { getDebugger } from '@microgamma/loggator';


const debug = getDebugger('microgamma:serverless-apigator');

export class ServerlessApigator {

  public hooks: any = {
    'before:package:initialize': () => {
      debug('before:package:initialize');

      return this.configureFunctions(true);
    },

    'before:invoke:local:invoke': () => {
      debug('before:invoke:local:invoke');
      return this.configureFunctions();
    },

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

  constructor(private serverless: any, private options: any = {}) {

    this.options = options;
    const customOptions = serverless.service.custom.apigator;

    this.servicePath = serverless.config.servicePath;
    debug('servicePath:', this.servicePath);

    this.buildFolder = customOptions.buildFolder;
    debug('build folder', this.buildFolder);

    const awsService = serverless.service.service;
    this.serviceName = awsService;
    debug('awsService name', awsService);
    debug('stage', this.options.stage);

    if (!customOptions.entrypoint) {
      throw new Error('you shall provide path to your entrypoint');
    }

    this.entrypoint = customOptions.entrypoint;
    debug('entrypoint', this.entrypoint);

  }

  public async configureFunctions(forDeployment = false) {
    const modulePath = `${this.buildFolder}`;
    // `${this.servicePath}/${this.entrypoint}`;

    debug('importing service definition from', modulePath);


    const module = await this.importModule(modulePath);

    this.serverless.cli.log('Injecting configuration');
    debug('module found', module);

    const endpoint = module.default;


    const endpointMetadata: EndpointOptions = getEndpointMetadataFromClass(endpoint);
    debug('Endpoint', endpointMetadata);

    const lambdas = getLambdaMetadataFromClass(endpoint);
    debug('Lambdas', lambdas);

    const authorizerFn = getAuthorizerMetadataFromClass(endpoint);

    this.serverless.cli.log('Parsing Apigator Service definitions');

    if (authorizerFn) {
      debug('auth function found', authorizerFn);
      this.serverless.cli.log('Setting up custom authorizer');
      this.addFunctionToService(endpointMetadata, authorizerFn, forDeployment);

    }

    for (const lambda of lambdas) {
      debug('configuring lambda', lambda);

      this.addFunctionToService(endpointMetadata, lambda, forDeployment);

      debug('functions are');
      debug(this.serverless.service.functions[lambda.name]);
      debug(this.serverless.service.functions[lambda.name].events);
    }

    this.serverless.cli.log(`${lambdas.length} functions configured`);
  }


  public async importModule(path: string) {
    return import(path);
  }

  public addFunctionToService(endpoint: EndpointOptions, lambda: LambdaOptions, forDeployment = false) {
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

    let entrypoint = this.entrypoint;
    const path = basePath + lambda.path;
    const method = lambda.method;
    const authorizer = lambda.hasOwnProperty('authorizer') ? lambda.authorizer : null;

    const httpEvent: LambdaOptions & { integration: string } = {
      integration: lambda.integration || 'lambda',
      cors: corsOption,
      private: privateLambda
    };

    if (lambda.path) {
      httpEvent.path = path;
    }

    if (method) {
      httpEvent.method = method;
    }

    if (authorizer) {
      httpEvent.authorizer = authorizer;
    }

    if (forDeployment) {

      entrypoint = entrypoint.split('/').filter((pathPart) => {
        return pathPart !== '..';
      }).join('/');
    }

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

    this.serverless.service.functions[lambda.name] = lambdaDef;

    debug('function configured', this.serverless.service.functions[lambda.name]);

  }

}
