import { findDOMNode } from 'react-dom';

var getRefTarget = function getRefTarget(ref) {
  return ref && ('current' in ref ? ref.current : ref);
};

export default function getDOMNode(elementOrRef) {
  // If elementOrRef is an instance of Position, child is returned. [PositionInstance]
  var element = (elementOrRef === null || elementOrRef === void 0 ? void 0 : elementOrRef.root) || (elementOrRef === null || elementOrRef === void 0 ? void 0 : elementOrRef.child) || getRefTarget(elementOrRef); // Native HTML elements

  if (element !== null && element !== void 0 && element.nodeType && typeof (element === null || element === void 0 ? void 0 : element.nodeName) === 'string') {
    return element;
  } // If you can't get the native HTML element, you can only get it through findDOMNode.
  // eslint-disable-next-line react/no-find-dom-node


  return findDOMNode(element);
}