import { getDebugger } from '@microgamma/loggator';
import { getBodyMetadata, getHeaderMetadata, getLambdaMetadataFromClass, getPathMetadata } from '@microgamma/apigator';

const d = getDebugger('microgamma:endpoint.mock');

export function EndpointMock(serviceClass) {

  const service = serviceClass.prototype;

  const configuredLambdas = getLambdaMetadataFromClass(serviceClass);
  d({ configuredLambdas });

  configuredLambdas.forEach((lambdaConfiguration) => {
    const functionName = lambdaConfiguration.name;
    const originalFn = service[functionName];
    spyOn(service, functionName).and.callFake((...args) => {
      d('args are', args);
      const pathParams = getPathMetadata(service, functionName);
      d({pathParams});

      const body = getBodyMetadata(service, functionName);
      d({body});

      const headerParams = getHeaderMetadata(service, functionName);
      d({headerParams});

      const event = {
        path: {},
        body: {},
        headers: {}
      };

      Object.keys(pathParams).forEach((key) => {
        const index = pathParams[key];

        event['path'][key] = args[index];

      });

      Object.keys(body).forEach((key) => {
        const index = body[key];

        event['body'] = args[index];

      });


      Object.keys(headerParams).forEach((key) => {
        const index = headerParams[key];

        event['headers'][key] = args[index];

      });


      d({event});


      return originalFn.apply(service, [
        event, // event,
        {} // context
      ])

    })

  });

  return serviceClass;
}
