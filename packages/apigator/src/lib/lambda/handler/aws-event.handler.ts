import { APIGatewayEvent, APIGatewayEventRequestContext } from 'aws-lambda';
import { LambdaDefaultHandler } from './';

type AwsLambdaArguments = [APIGatewayEvent, APIGatewayEventRequestContext];

export class AwsEventHandler extends LambdaDefaultHandler {

  public getBody([event, context]: AwsLambdaArguments): {} {
    return event.body;
  }

  public getPathParams([event, context]: AwsLambdaArguments): {} {
    return event.path || event.pathParameters;
  }

  public getHeaderParams([event, context]: AwsLambdaArguments): {} {
    return event.headers;
  }

  public async runOriginalFunction(originalFunction, instance, newArgs) {
    try {

      return originalFunction.apply(instance, newArgs);

    } catch (e) {
      throw this.handleError(e);
    }
  }
}
