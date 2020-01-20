import { Injectable } from '@microgamma/digator';

@Injectable()
export class LambdaHandler {

  public getBody(args) {
    return args;
  };
  public getPathParams(args) {
    return args;
  };
  public getHeaderParams(args) {
    return args;
  };
}
