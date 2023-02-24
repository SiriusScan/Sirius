# DOM helper library

[![CI](https://github.com/rsuite/dom-lib/workflows/Node.js%20CI/badge.svg)](https://github.com/rsuite/dom-lib/actions)
[![NPM Version](https://img.shields.io/npm/v/dom-lib?color=33cd56&logo=npm)](https://www.npmjs.com/package/dom-lib)

Click the "Exports" link in the sidebar to see a complete list of everything in the package.

## Install

```
npm install dom-lib --save
```

## Usage

```js
import addClass from 'dom-lib/addClass';

addClass(element, 'foo');
// output: <div class="foo"></div>
```

## API

Class

```typescript
hasClass: (node: Element, className: string) => boolean;
addClass: (node: Element, className: string) => Element;
removeClass: (node: Element, className: string) => Element;
toggleClass: (node: Element, className: string) => Element;
```

Style

```typescript
getStyle: (node: Element, property: string) => string;
getStyle: (node: Element) => Object;

removeStyle: (node: Element, property: string) => void;
removeStyle: (node: Element, propertys: Array<string>) => void;

addStyle: (node: Element, property: string, value: string) => void;
addStyle: (node: Element, style: Object) => void;
```

Events

```typescript
on: (target: Element, eventName: string, listener: Function, capture: boolean = false) => {
  off: Function;
};
off: (target: Element, eventName: string, listener: Function, capture: boolean = false) =>
  void;
```

Query

```typescript
activeElement: () => Element;
getHeight: (node: Element, client: Element) => number;
getWidth: (node: Element, client: Element) => number;
getOffset: (node: Element) => Object;
getOffsetParent: (node: Element) => Object;
getPosition: (node: Element, offsetParent) => Object;
getWindow: (node: Element) => String;
nodeName: (node: Element) => String;
ownerDocument: (node: Element) => Object;
ownerWindow: (node: Element) => Object;
contains: (context: Element, node: Element) => boolean;
scrollLeft: (node: Element) => number;
scrollTop: (node: Element) => number;
isFocusable: (node: Element) => boolean;
```

Utils

```typescript
scrollLeft: (node: Element)=> number;
scrollLeft: (node: Element, val: number)=> void;

scrollTop: (node: Element)=> number;
scrollTop: (node: Element, val: number) => void;
```
