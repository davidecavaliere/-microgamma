import { LambdaDefaultHandler } from './';

export class ExpressEventHandler extends LambdaDefaultHandler {

  public getPathParams([req, res]): any {
    return req.params;
  }

  public getHeaderParams([req, res]): any {
    return req.headers;
  }

  public getBody([req, res]): any {
    return req.body;
  }

  public async runOriginalFunction(originalFunction: any, instance: any, newArgs: any, [req, res]): Promise<any> {

    try {
      const retValue = await originalFunction.apply(instance, newArgs);
      return res.json(retValue);
    } catch (e) {

      const match = e.message.match(/^\[([0-9]{3,})\](.)+/);

      if (match) {
        return res.status(+match[1]).json(e.message);
      } else {
        res.status(500).json(`[500] ${e.message}`);
      }

    }
  }
}
