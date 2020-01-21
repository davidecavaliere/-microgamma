import { Injectable } from '@microgamma/digator';

@Injectable()
export class LambdaDefaultHandler {

  public getBody(args) {
    return args;
  };

  public getPathParams(args) {
    return args;
  };

  public getHeaderParams(args) {
    return args;
  };

  public async runOriginalFunction(originalFunction, instance, newArgs, originalArgs?) {
    try {
      return originalFunction.apply(instance, originalArgs);
    } catch (e) {
      throw this.handleError(e);
    }
  }

  protected handleError(e) {
    if (e instanceof Error) {

      if (e.message.match(/^\[[0-9]{3,}\](.)+/)) {
        return e;
      } else {
        return Error(`[500] ${e.message}`);
      }

    }

    // encapsulate any other type of error
    return Error(e);

  }
}
