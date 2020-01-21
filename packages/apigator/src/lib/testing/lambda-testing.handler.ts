import { LambdaDefaultHandler } from '@microgamma/apigator';

export class LambdaTestingHandler extends LambdaDefaultHandler {

  public async runOriginalFunction(originalFunction, instance, newArgs, originalArgs?): Promise<any> {
    return originalFunction.apply(instance, originalArgs);
  }
}
