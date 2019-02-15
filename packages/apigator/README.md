# Apigator [![Build Status](https://travis-ci.org/davidecavaliere/apigator.svg?branch=master)](https://travis-ci.org/davidecavaliere/apigator) [![codecov](https://codecov.io/gh/davidecavaliere/apigator/branch/master/graph/badge.svg)](https://codecov.io/gh/davidecavaliere/apigator)

This project is mean to make more elegant api endpoint using typescript classes and decorators.

## What is does

- extracts variables from `event`. Doesn't matter if they're in the body or in the header or path: just put the variable's name you wan to retrieve as an argument of the function.
- bear in mind that the option object passed to the @Lambda decorator do not have any effect if you don't use the serverless framework.


## How to use
`npm i -S @microgamma/apigator`

```
// handler.ts

export class MyService {

  @Lambda({
    name: 'findAll',
    path: '/{name}',
    method: 'GET'
  })
  public async hello(name) {
    return `Hello ${name}`;
  }
}

module.exports = new MyService();

// in this case handler would be handler.hello
```

compile your ts file and upload it to aws.

