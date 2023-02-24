"use strict";

exports.__esModule = true;
exports.useFormClassNames = useFormClassNames;

var _utils = require("../utils");

/**
 * Take <Form> props and return className for <Form> styles
 */
function useFormClassNames(_ref) {
  var _ref$classPrefix = _ref.classPrefix,
      classPrefix = _ref$classPrefix === void 0 ? 'form' : _ref$classPrefix,
      className = _ref.className,
      fluid = _ref.fluid,
      _ref$layout = _ref.layout,
      layout = _ref$layout === void 0 ? 'vertical' : _ref$layout,
      readOnly = _ref.readOnly,
      plaintext = _ref.plaintext,
      disabled = _ref.disabled;

  var _useClassNames = (0, _utils.useClassNames)(classPrefix),
      withClassPrefix = _useClassNames.withClassPrefix,
      merge = _useClassNames.merge;

  return merge(className, withClassPrefix(layout, fluid && layout === 'vertical' ? 'fluid' : 'fixed-width', {
    readonly: readOnly,
    disabled: disabled,
    plaintext: plaintext
  }));
}