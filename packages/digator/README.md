# @microgamma/digator [![npm version](https://badge.fury.io/js/%40microgamma%2Fdigator.svg)](https://badge.fury.io/js/%40microgamma%2Fdigator)

## install

`npm i -S @microgamma/digator` or `yarn add @microgamma/digator`

## How to use

Decorate your singleton with `@Injectable()`.

```
// my-class.ts


import { Injectable } from '@microgamma/digator';

@Injectable()
class MyClass {

  public sayHello(name: string) {
    return `Hello ${name}`;
  }
}
```

Decorate a class's field with `@Inject(<Class>)` to assign it the singleton.

```
// consumer.ts

import { Inject } from '@microgamma/digator';

class Consumer {

  @Inject(MyClass)
  public myClassSingleton;

  constructor() {
    this.myClassSingleton.sayHello('consumer');
  }

}
```

Alternatively you can get a signleton using the `getSingleton(<Class>)` function.

```
// my-script.ts

const singleton = getSingleton(MyClass);

```