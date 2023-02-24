import React from 'react';
var Loader = /*#__PURE__*/React.forwardRef(function (props, ref) {
  var loadAnimation = props.loadAnimation,
      loading = props.loading,
      locale = props.locale,
      addPrefix = props.addPrefix,
      renderLoading = props.renderLoading;
  var loadingElement = /*#__PURE__*/React.createElement("div", {
    ref: ref,
    className: addPrefix('loader-wrapper')
  }, /*#__PURE__*/React.createElement("div", {
    className: addPrefix('loader')
  }, /*#__PURE__*/React.createElement("i", {
    className: addPrefix('loader-icon')
  }), /*#__PURE__*/React.createElement("span", {
    className: addPrefix('loader-text')
  }, locale === null || locale === void 0 ? void 0 : locale.loading))); // Custom render a loader

  if (typeof renderLoading === 'function') {
    return loading ? renderLoading(loadingElement) : null;
  } // If loadAnimation is true , it returns the DOM element,
  // and controls whether the loader is displayed through CSS to achieve animation effect.


  return loading || loadAnimation ? loadingElement : null;
});
Loader.displayName = 'Table.Loader';
export default Loader;