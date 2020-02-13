// tslint:disable:only-arrow-functions readonly-array prefer- no-if-statement no-object-mutation no-this no-empty-interface
import { FunctionType } from '../types';

/**
 * Runs the `fn` before the annotated method
 *
 * @remarks
 * Decorate a method to execute `fn` before it.
 * `fn` params will be the same type as the decorated function and it __must__ return the same type.
 * To have type checking you need to provide type information into this decorator generics.
 * `fn` can __must__ return this same type or void.
 *
 * @example
 * ```typescript
 * // basic example
 * class TestClass {
 *
 *   @Before<string>((name) => {
 *     return name.toUpperCase();
 *   })
 *   public simpleParamSimpleType(name: string) {
 *     return `hello ${name}`;
 *   }
 * }
 * ```
 * For more example see `before.decorator.spec.ts`
 *
 * @param fn
 */
export function Before<P>(fn: FunctionType<P, P>): MethodDecorator {

  return <T>(target: T, key: string, descriptor: PropertyDescriptor) => {

    const originalMethod = descriptor.value;

    descriptor.value = function() {

      const retValue = fn.bind(this).apply(this, arguments);

      // so here we can call originalMethod with retValue
      // doing so beforeFn has the ability to change original arguments's values
      if (retValue === undefined) {
        return originalMethod.apply(this, arguments);
      }

      return originalMethod.apply(this, [].concat(retValue));
    };

    return descriptor;
  };
}
