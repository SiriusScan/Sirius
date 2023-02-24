import _extends from "@babel/runtime/helpers/esm/extends";
import * as helpers from 'dom-lib';
import isElement from './isElement';
export * from 'dom-lib';

var DOMHelper = _extends({}, helpers, {
  isElement: isElement
});

export default DOMHelper;