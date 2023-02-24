"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _utils = require("../utils");

var _Plaintext = _interopRequireDefault(require("../Plaintext"));

var _Loader = _interopRequireDefault(require("../Loader"));

var Toggle = /*#__PURE__*/_react.default.forwardRef(function (props, ref) {
  var _props$as = props.as,
      Component = _props$as === void 0 ? 'span' : _props$as,
      disabled = props.disabled,
      readOnly = props.readOnly,
      _props$loading = props.loading,
      loading = _props$loading === void 0 ? false : _props$loading,
      plaintext = props.plaintext,
      className = props.className,
      checkedChildren = props.checkedChildren,
      unCheckedChildren = props.unCheckedChildren,
      _props$classPrefix = props.classPrefix,
      classPrefix = _props$classPrefix === void 0 ? 'toggle' : _props$classPrefix,
      checkedProp = props.checked,
      defaultChecked = props.defaultChecked,
      size = props.size,
      localeProp = props.locale,
      onChange = props.onChange,
      rest = (0, _objectWithoutPropertiesLoose2.default)(props, ["as", "disabled", "readOnly", "loading", "plaintext", "className", "checkedChildren", "unCheckedChildren", "classPrefix", "checked", "defaultChecked", "size", "locale", "onChange"]);
  var inputRef = (0, _react.useRef)(null);

  var _useControlled = (0, _utils.useControlled)(checkedProp, defaultChecked),
      checked = _useControlled[0],
      setChecked = _useControlled[1];

  var _useCustom = (0, _utils.useCustom)('Toggle', localeProp),
      locale = _useCustom.locale;

  var _useClassNames = (0, _utils.useClassNames)(classPrefix),
      merge = _useClassNames.merge,
      withClassPrefix = _useClassNames.withClassPrefix,
      prefix = _useClassNames.prefix;

  var classes = merge(className, withClassPrefix(size, {
    checked: checked,
    disabled: disabled,
    loading: loading
  }));
  var inner = checked ? checkedChildren : unCheckedChildren;
  var label = checked ? locale.on : locale.off;

  var _partitionHTMLProps = (0, _utils.partitionHTMLProps)(rest),
      htmlInputProps = _partitionHTMLProps[0],
      restProps = _partitionHTMLProps[1];

  var handleInputChange = (0, _react.useCallback)(function (e) {
    if (disabled || readOnly || loading) {
      return;
    }

    var checked = e.target.checked;
    setChecked(checked);
    onChange === null || onChange === void 0 ? void 0 : onChange(checked, e);
  }, [disabled, readOnly, loading, setChecked, onChange]);

  if (plaintext) {
    return /*#__PURE__*/_react.default.createElement(_Plaintext.default, null, inner || label);
  }

  return /*#__PURE__*/_react.default.createElement("label", (0, _extends2.default)({
    ref: ref,
    className: classes
  }, restProps), /*#__PURE__*/_react.default.createElement("input", (0, _extends2.default)({}, htmlInputProps, {
    ref: inputRef,
    type: "checkbox",
    checked: checkedProp,
    defaultChecked: defaultChecked,
    disabled: disabled,
    readOnly: readOnly,
    onChange: handleInputChange,
    className: prefix('input'),
    role: "switch",
    "aria-checked": checked,
    "aria-disabled": disabled,
    "aria-label": typeof inner === 'string' ? inner : label,
    "aria-busy": loading || undefined
  })), /*#__PURE__*/_react.default.createElement(Component, {
    className: prefix('presentation')
  }, /*#__PURE__*/_react.default.createElement("span", {
    className: prefix('inner')
  }, inner), loading && /*#__PURE__*/_react.default.createElement(_Loader.default, {
    className: prefix('loader')
  })));
});

Toggle.displayName = 'Toggle';
Toggle.propTypes = {
  disabled: _propTypes.default.bool,
  readOnly: _propTypes.default.bool,
  plaintext: _propTypes.default.bool,
  checked: _propTypes.default.bool,
  defaultChecked: _propTypes.default.bool,
  checkedChildren: _propTypes.default.node,
  unCheckedChildren: _propTypes.default.node,
  loading: _propTypes.default.bool,
  classPrefix: _propTypes.default.string,
  className: _propTypes.default.string,
  onChange: _propTypes.default.func,
  as: _propTypes.default.elementType,
  size: _propTypes.default.oneOf(['sm', 'md', 'lg']),
  locale: _propTypes.default.shape({
    on: _propTypes.default.string,
    off: _propTypes.default.string
  })
};
var _default = Toggle;
exports.default = _default;