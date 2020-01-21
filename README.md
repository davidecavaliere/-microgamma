

# Microgamma (µγ) [![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lernajs.io/) [![Build Status](https://travis-ci.org/davidecavaliere/-microgamma.svg?branch=master)](https://travis-ci.org/davidecavaliere/-microgamma) [![codecov](https://codecov.io/gh/davidecavaliere/-microgamma/branch/master/graph/badge.svg)](https://codecov.io/gh/davidecavaliere/-microgamma) [![Gitter](https://badges.gitter.im/microgamma/community.svg)](https://gitter.im/microgamma/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Microgamma is a framework for api development in Typescript. It allows to create endpoints in the form of classes. Annotate them with `@Endpoint` and `@Lambda` with metadata that can be retrived at runtime to bind them to providers such as AWS Lambda, Express.js, Google Functions, Azure Function and potentially any.

> At the moment the only providers available are AWS with their Lambda service and Express.js see [use with express.js](#use-with-express.js)
> A [serverless](https://serverless.com/) plugin is provided. It uses the metadata within the classes to __create at runtime__ the serverless configuration. In other words the developer won't need to worry about adding/editing `serverless.yml` functions section.  See [serverless-apigator](#serverless-apigator)

## How to use it
### Install
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
Usually the developer won't need to do the above though.

 # Examples
## Use with express.js
Install express.js
```
yarn add express @types/express
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

---

 ## Use with Serverless Framework



 # Other packages

- [datagator](https://github.com/davidecavaliere/-microgamma/blob/master/packages/datagator/README.md) - a set of decorators and abstract classes to simplify interaction with MongoDB from you AWS lambda function
- mongodb
- dynamodb
- [digator](https://github.com/davidecavaliere/-microgamma/blob/master/packages/digator/README.md) - the simplest di container around
- [loggator](https://github.com/davidecavaliere/-microgamma/blob/master/packages/loggator/README.md) - a wrapper for visionmedia's debug
---

