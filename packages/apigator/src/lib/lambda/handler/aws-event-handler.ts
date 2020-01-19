import { Injectable } from '@microgamma/digator';
import { APIGatewayEvent } from 'aws-lambda';

@Injectable()
export class AwsEventHandler {


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
