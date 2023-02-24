import React from 'react';
export var DisclosureActionTypes;

(function (DisclosureActionTypes) {
  DisclosureActionTypes[DisclosureActionTypes["Show"] = 0] = "Show";
  DisclosureActionTypes[DisclosureActionTypes["Hide"] = 1] = "Hide";
})(DisclosureActionTypes || (DisclosureActionTypes = {}));

var DisclosureContext = /*#__PURE__*/React.createContext(null);
DisclosureContext.displayName = 'Disclosure.Context';
export default DisclosureContext;