# serverless-apigator

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
