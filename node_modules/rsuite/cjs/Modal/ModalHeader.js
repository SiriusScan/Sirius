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

var _ModalContext = require("./ModalContext");

var _CloseButton = _interopRequireDefault(require("../CloseButton"));

var _Close = _interopRequireDefault(require("@rsuite/icons/Close"));

var _IconButton = _interopRequireDefault(require("../IconButton"));

var ModalHeader = /*#__PURE__*/_react.default.forwardRef(function (props, ref) {
  var _props$as = props.as,
      Component = _props$as === void 0 ? 'div' : _props$as,
      _props$classPrefix = props.classPrefix,
      classPrefix = _props$classPrefix === void 0 ? 'modal-header' : _props$classPrefix,
      className = props.className,
      _props$closeButton = props.closeButton,
      closeButton = _props$closeButton === void 0 ? true : _props$closeButton,
      children = props.children,
      onClose = props.onClose,
      rest = (0, _objectWithoutPropertiesLoose2.default)(props, ["as", "classPrefix", "className", "closeButton", "children", "onClose"]);

  var _useClassNames = (0, _utils.useClassNames)(classPrefix),
      merge = _useClassNames.merge,
      withClassPrefix = _useClassNames.withClassPrefix,
      prefix = _useClassNames.prefix;

  var classes = merge(className, withClassPrefix());
  var context = (0, _react.useContext)(_ModalContext.ModalContext);
  var buttonElement = !(context !== null && context !== void 0 && context.isDrawer) ? /*#__PURE__*/_react.default.createElement(_CloseButton.default, {
    className: prefix('close'),
    onClick: (0, _utils.createChainedFunction)(onClose, context === null || context === void 0 ? void 0 : context.onModalClose)
  }) : /*#__PURE__*/_react.default.createElement(_IconButton.default, {
    icon: /*#__PURE__*/_react.default.createElement(_Close.default, null),
    appearance: "subtle",
    size: "sm",
    className: prefix('close'),
    onClick: (0, _utils.createChainedFunction)(onClose, context === null || context === void 0 ? void 0 : context.onModalClose)
  });
  return /*#__PURE__*/_react.default.createElement(Component, (0, _extends2.default)({}, rest, {
    ref: ref,
    className: classes
  }), closeButton && buttonElement, children);
});

ModalHeader.displayName = 'ModalHeader';
ModalHeader.propTypes = {
  as: _propTypes.default.elementType,
  classPrefix: _propTypes.default.string,
  className: _propTypes.default.string,
  closeButton: _propTypes.default.bool,
  children: _propTypes.default.node,
  onHide: _propTypes.default.func
};
var _default = ModalHeader;
exports.default = _default;