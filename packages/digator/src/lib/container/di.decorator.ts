import { getDebugger } from '@microgamma/loggator';

const d = getDebugger('microgamma:di:container');

interface DIOptions {
  [k: string]: any
}

export function DI(options: DIOptions): ClassDecorator {

  d('running @DI function');
  d({ options });

  return (target) => {
    d({ target });



    return target;
  }
}