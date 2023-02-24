"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _utils = require("../utils");

var sizerStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  visibility: 'hidden',
  height: 0,
  overflow: 'scroll',
  whiteSpace: 'pre'
};

var copyStyles = function copyStyles(styles, node) {
  node.style.fontSize = styles.fontSize;
  node.style.fontFamily = styles.fontFamily;
  node.style.fontWeight = styles.fontWeight;
  node.style.fontStyle = styles.fontStyle;
  node.style.letterSpacing = styles.letterSpacing;
  node.style.textTransform = styles.textTransform;
};

/**
 * Use a dynamic input width.
 * The width is automatically adjusted according to the length of the input text characters.
 * @param props
 * @param sizerRef
 * @param placeholderRef
 */
var useInputWidth = function useInputWidth(props, sizerRef, placeholderRef) {
  var _props$minWidth = props.minWidth,
      minWidth = _props$minWidth === void 0 ? 1 : _props$minWidth,
      placeholder = props.placeholder,
      value = props.value,
      onAutosize = props.onAutosize;

  var _useState = (0, _react.useState)(minWidth),
      inputWidth = _useState[0],
      setInputWidth = _useState[1];

  (0, _react.useEffect)(function () {
    if (!sizerRef.current || typeof sizerRef.current.scrollWidth === 'undefined') {
      return;
    }

    var width;

    if (placeholder && !value && placeholderRef.current) {
      width = Math.max(sizerRef.current.scrollWidth, placeholderRef.current.scrollWidth) + 2;
    } else {
      width = sizerRef.current.scrollWidth + 2;
    }

    if (width < minWidth) {
      width = minWidth;
    }

    if (width !== inputWidth) {
      setInputWidth(width);
      onAutosize === null || onAutosize === void 0 ? void 0 : onAutosize(width);
    }
  }, [minWidth, placeholder, inputWidth, value, placeholderRef, sizerRef, onAutosize]);
  return inputWidth;
};

var InputAutosize = /*#__PURE__*/_react.default.forwardRef(function (props, ref) {
  var uniqueId = (0, _react.useMemo)(function () {
    return (0, _utils.guid)();
  }, []);
  var defaultValue = props.defaultValue,
      value = props.value,
      style = props.style,
      className = props.className,
      placeholder = props.placeholder,
      inputClassName = props.inputClassName,
      inputStyle = props.inputStyle,
      _props$inputId = props.inputId,
      inputId = _props$inputId === void 0 ? uniqueId : _props$inputId,
      tabIndex = props.tabIndex;
  var rootRef = (0, _react.useRef)(null);
  var inputRef = (0, _react.useRef)(null);
  var sizerRef = (0, _react.useRef)(null);
  var placeholderRef = (0, _react.useRef)(null);
  (0, _react.useImperativeHandle)(ref, function () {
    return {
      root: rootRef.current,
      input: inputRef.current
    };
  });
  var sizerValue = [defaultValue, value, ''].reduce(function (previousValue, currentValue) {
    if (previousValue !== null && previousValue !== undefined) {
      return previousValue;
    }

    return currentValue;
  });
  var inputWidth = useInputWidth(props, sizerRef, placeholderRef);
  var wrapperStyle = (0, _extends2.default)({
    display: 'inline-block'
  }, style);
  var nextInputStyle = (0, _extends2.default)({
    boxSizing: 'content-box',
    width: inputWidth + "px"
  }, inputStyle);
  (0, _react.useEffect)(function () {
    if (!window.getComputedStyle) {
      return;
    }

    var input = inputRef.current;
    var inputStyles = input && window.getComputedStyle(input);

    if (!inputStyles) {
      return;
    }

    if (sizerRef.current) {
      copyStyles(inputStyles, sizerRef.current);
    }

    if (placeholderRef.current) {
      copyStyles(inputStyles, placeholderRef.current);
    }
  }, []);

  var _partitionHTMLProps = (0, _utils.partitionHTMLProps)(props),
      htmlInputProps = _partitionHTMLProps[0];

  htmlInputProps.className = inputClassName;
  htmlInputProps.style = nextInputStyle;
  htmlInputProps.tabIndex = tabIndex;

  if ((0, _utils.isIE)()) {
    // On Internet Explorer, an `x` symbol will appear in the input box.
    // By setting an id, matching the style, hiding the `x` symbol by the style.
    htmlInputProps.id = inputId;
  }

  return /*#__PURE__*/_react.default.createElement("div", {
    ref: rootRef,
    className: className,
    style: wrapperStyle
  }, (0, _utils.isIE)() ? /*#__PURE__*/_react.default.createElement("style", {
    dangerouslySetInnerHTML: {
      __html: "input#" + inputId + "::-ms-clear {display: none;}"
    }
  }) : null, /*#__PURE__*/_react.default.createElement("input", (0, _extends2.default)({}, htmlInputProps, {
    ref: inputRef,
    type: "text"
  })), /*#__PURE__*/_react.default.createElement("div", {
    ref: sizerRef,
    style: sizerStyle
  }, sizerValue), placeholder ? /*#__PURE__*/_react.default.createElement("div", {
    ref: placeholderRef,
    style: sizerStyle
  }, placeholder) : null);
});

InputAutosize.displayName = 'InputAutosize';
InputAutosize.propTypes = {
  className: _propTypes.default.string,
  defaultValue: _propTypes.default.any,
  inputId: _propTypes.default.string,
  inputClassName: _propTypes.default.string,
  inputStyle: _propTypes.default.object,
  minWidth: _propTypes.default.number,
  onChange: _propTypes.default.func,
  placeholder: _propTypes.default.string,
  style: _propTypes.default.object,
  value: _propTypes.default.any,
  onAutosize: _propTypes.default.func
};
var _default = InputAutosize;
exports.default = _default;