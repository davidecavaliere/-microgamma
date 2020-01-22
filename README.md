# Microgamma (µγ) [![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lernajs.io/) [![Build Status](https://travis-ci.org/davidecavaliere/-microgamma.svg?branch=master)](https://travis-ci.org/davidecavaliere/-microgamma) [![codecov](https://codecov.io/gh/davidecavaliere/-microgamma/branch/master/graph/badge.svg)](https://codecov.io/gh/davidecavaliere/-microgamma) [![Gitter](https://badges.gitter.im/microgamma/community.svg)](https://gitter.im/microgamma/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Microgamma is a framework for api development in Typescript. It allows to create endpoints in the form of classes. Annotate them with `@Endpoint` and `@Lambda` with metadata that can be retrived at runtime to bind them to providers such as AWS Lambda, Express.js, Google Functions, Azure Function and potentially any.

> At the moment the only provider available are AWS with their Lambda service and Express.js see [use with express.js](#use-with-express.js)
> A [serverless](https://serverless.com/) plugin is provided. It uses the metadata  within the classes to __create at runtime__ the serverless configuration. In other words the developer won't need to worry about adding/editing `serverless.yml` functions section.  See [serverless-apigator](https://github.com/davidecavaliere/-microgamma/blob/master/packages/serverless-apigator/README.md)

## How to use it
 Install
```
yarn add @microgamma/apigator
```
Create a service file.

```typescript
// my-first.service.ts
import { Endpoint, Lambda } from '@microgamma/apigator';

@Endpoint({
  cors: true,
  name: 'my-first-service',
  private: false
})
export class MyFirstService {

  @Lambda({
    method: 'GET',
    path: '/'
  })
  public index() {
    return `Hello world! Today is ${new Date().toISOString()}`;
  }
}
```
Now you can retrieve the metadata at run time:

```typescript
import { getEndpointMetadataFromClass, getLambdaMetadataFromClass } from '@microgamma/apigator';
import { MyFirstService } from './my-first.service';

const endpointMetadata = getEndpointMetadataFromClass(MyFirstService);
console.log({endpointMetadata});
const lambdas = getLambdaMetadataFromClass(MyFirstService);

lambdas.forEach((lambda) => console.log({lambda}));

/*
{
  endpointMetadata: { cors: true, name: 'my-first-service', private: false }
}
{
  lambda: { method: 'GET', path: '/', integration: 'lambda', name: 'index' }
}
*/
```
Usually you won't need to do the above though.

### @Lambda
The `@Lambda` decorator stores the provided metadata and wraps the annotated method inside an asyncronious function. At runtime the function's real arguments may vary: i.e.: if it's called as an Aws Lamdbda its arguments will be `event, context` whether if called within express they will be `request, response`. To handle the differences between enviroments we use a service called `LambdaDefaultHandler`. By default the `AwsEventHandler` is used. To use a different handler it must be specified in the `@Endpoint` decorator (see below).

Valid values are:
```typescript
interface LambdaOptions {
  name?: string;  // name of the function, MUST not be set!
  path: string;  // the sub path which the lambda will be available.
  method: string;  // http method. can be any of the http verbs
  integration?: string; // only when using serverless: the integration to use. This is equivalent to set the integration into serverless.yml (Default: 'lambda')
  private?: boolean;  // only when using serverless: equivalent to set private in serverless.yml (Default: false)
  cors?: boolean;  // only when using serverless: equivalent to set cors in serverless.yml defaults to false
  authorizer?: string | {};  // only when using serverless: equivalent to providing an authorizer function in serverless.yml
  description?: string;
}
```

### @Endpoint
The endpoint decorator stores the provided metadata and also sets the implementation of the `LambdaDefaultHandler` to use.
Valid values are:
```typescript
interface EndpointOptions {
  readonly name: string;  // name of the endpoint
  readonly basePath?: string;  // base path that will be prepended to the path defined in each lambda.
  readonly private?: boolean;  // Default: false. Setting this field is equivalent to add its value to every @Lambda. If any @Lambda as private set then that will have precedence
  readonly cors?: boolean;  // Default: false. Same as private.
  readonly providers?: Array<{provide: any, implementation: any}>;  // Use the provided implementation instead of the default.
}
```
I.e. when using it with express.js `ExpressEventHandler` needs to be used.
```typescript

@Endpoint({
  cors: true,
  name: 'my-first-service',
  private: false,
  providers: [{
    provide: LambdaDefaultHandler,
    implementation: ExpressEventHandler
  }]
})
```
### @Path
Retrieves a value from the path and assign it to the annotated argument
```typescript
@Lambda({
  method: 'GET',
  path: '/me/{name}'
})
public me(@Path('name') user) {
  return `Hello ${user}`;
}
```

### @Body
Retrieves the body and assign it to the annotated argument
```typescript
@Lambda({
  method: 'POST',
  path: '/me'
})
public me(@Body() user) {
  return `Hello ${user}`;
}
```

### @Header
Retrieves a value from the http headers and assign it to the annotated argument
```typescript
@Lambda({
  method: 'GET',
  path: '/me'
})
public me(@Header('name') user) {
  return `Hello ${user}`;
}
```

## Use with express.js
Install express.js
```
yarn add express @types/express
```
Set `ExpressEventHanlder` as described above.

Be aware that express uses the `:param` notation for path parameters so the lambda path need to be such as

```typescript
@Lambda({
  method: 'GET',
  path: '/me/:name'
})
public me(@Path('name') user) {
  return `Hello ${user}`;
}
```

Create `server.ts` file:

```typescript
import { bootstrap, getEndpointMetadataFromClass, getLambdaMetadataFromClass, LambdaOptions } from '@microgamma/apigator';
import express, { Application } from 'express';
import { MyFirstService } from './my-first.service';

const app: Application = express();
const port = 3000;

const service = bootstrap(MyFirstService);

function createExpressHandler(lambda: LambdaOptions, app: Express.Application) {
  app[lambda.method.toLowerCase()](lambda.path, service[lambda.name]);
}

lambdas.forEach((lambda) => createExpressHandler(lambda, app));

app.listen(port, () => console.log(`Example app listening on port ${port}!`));

```
Run after transpile or with `ts-node`

```bash
yarn ts-node server.ts
```
You can hit your lambda at `localhost:3000`

## Use with Serverless Framework

See [serverless-apigator](https://github.com/davidecavaliere/-microgamma/blob/master/packages/serverless-apigator/README.md) for more information.
