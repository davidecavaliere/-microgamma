# @microgamma/serverless-apigator [![serverless](https://camo.githubusercontent.com/547c6da94c16fedb1aa60c9efda858282e22834f/687474703a2f2f7075626c69632e7365727665726c6573732e636f6d2f6261646765732f76332e737667)](http://www.serverless.com) [![npm version](https://badge.fury.io/js/%40microgamma%2Fserverless-apigator.svg)](https://badge.fury.io/js/%40microgamma%2Fserverless-apigator)

Serverless plugin to simplify and make more elegant aws lambda development in typescript and automatically handle serverless' configuration file.

This is still under heavy development. Anything can change at any time.

Any help is very welcome. If you'd like to contribute please get in touch <cavaliere.davide@gmail.com>

Ideas:
  - define your service as a class annotating it to provide configuration
  - define lambdas as methods of a class and annotate them to provide configuration
  - lambdas are automatically wrapped into a promise
  - path and query parameters are automatically injected into the lambda
  - support for parameters validation
  - no need to change serverless.yml
