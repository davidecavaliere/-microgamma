import { APIGatewayEvent } from 'aws-lambda';
import { LambdaHandler } from './lambda-handler';

export class AwsEventHandler extends LambdaHandler {

  private getApiGatewayEvent(args): APIGatewayEvent {
    return args[0];
  }

  public getBody(args): {} {
    return this.getApiGatewayEvent(args).body;
  }

  public getPathParams(args) {
    const event: APIGatewayEvent = this.getApiGatewayEvent(args);
    return event.path || event.pathParameters;
  }

  public getHeaderParams(args) {
    return this.getApiGatewayEvent(args).headers;
  }
}
