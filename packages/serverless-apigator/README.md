# @microgamma/serverless-apigator [![serverless](https://camo.githubusercontent.com/547c6da94c16fedb1aa60c9efda858282e22834f/687474703a2f2f7075626c69632e7365727665726c6573732e636f6d2f6261646765732f76332e737667)](http://www.serverless.com) [![npm version](https://badge.fury.io/js/%40microgamma%2Fserverless-apigator.svg)](https://badge.fury.io/js/%40microgamma%2Fserverless-apigator)

serverless-apigator is a plugin for serverless to be use with `@microgamma/apigator`. It leverage the developer from maintain the `functions` section of serverless.yml so that configuration is written instead along the `@Endpoint` and `@Lambda` decorators.

> The only provider supported at this moment is aws

> A blue print to get you up and running quickly is available [here](https://github.com/microgamma/serverless-apigator-blue-print)

## How to use it
Install serverless
```
yarn add -D serverless
```
Create a `serverless.yml` file such as

```yaml
service: your-service-name # NOTE: update this with your service name

provider:
  name: aws
  runtime: nodejs12.x
  stage: dev
  region: eu-west-2

# add this plugin
plugins:
  - '@microgamma/serverless-apigator'

custom:
  apigator:
    entrypoint: handler # this is the file where the service is bootstrapped without .ts
    buildFolder: build/main # this is the folder where tsc transpiles your typescript code

# save S3 space excluding everything but build and node_modules folders
package:
  exclude:
    - ./*
    - ./**
    - '!build/**'
    - '!node_modules/**'
```

You won't need to provide the `functions` section as it will be written at runtime by this plugin.

See [@microgamma](https://github.com/davidecavaliere/-microgamma) for more information.
