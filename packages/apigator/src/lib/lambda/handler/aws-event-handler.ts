import { APIGatewayEvent, APIGatewayEventRequestContext } from 'aws-lambda';
import { LambdaHandler } from './lambda-handler';

type AwsLambdaArguments = [APIGatewayEvent, APIGatewayEventRequestContext];

export class AwsEventHandler extends LambdaHandler {

  public getBody([event, context]: AwsLambdaArguments): {} {
    return event.body;
  }

  public getPathParams([event, context]: AwsLambdaArguments): {} {
    return event.path || event.pathParameters;
  }

  public getHeaderParams([event, context]: AwsLambdaArguments): {} {
    return event.headers;
  }

  public async runOriginalFunction<T extends (...args: any[]) => any, RetType = ReturnType<T>>(originalFunction, instance, newArgs): Promise<RetType> {
    return originalFunction.apply(instance, newArgs);
  }
}
