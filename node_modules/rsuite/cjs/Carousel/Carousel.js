"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = void 0;

var _extends4 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _classnames = _interopRequireDefault(require("classnames"));

var _utils = require("../utils");

var Carousel = /*#__PURE__*/_react.default.forwardRef(function (props, ref) {
  var _sliderStyles, _ref;

  var _props$as = props.as,
      Component = _props$as === void 0 ? 'div' : _props$as,
      children = props.children,
      _props$classPrefix = props.classPrefix,
      classPrefix = _props$classPrefix === void 0 ? 'carousel' : _props$classPrefix,
      className = props.className,
      _props$placement = props.placement,
      placement = _props$placement === void 0 ? 'bottom' : _props$placement,
      _props$shape = props.shape,
      shape = _props$shape === void 0 ? 'dot' : _props$shape,
      autoplay = props.autoplay,
      _props$autoplayInterv = props.autoplayInterval,
      autoplayInterval = _props$autoplayInterv === void 0 ? 4000 : _props$autoplayInterv,
      activeIndexProp = props.activeIndex,
      _props$defaultActiveI = props.defaultActiveIndex,
      defaultActiveIndex = _props$defaultActiveI === void 0 ? 0 : _props$defaultActiveI,
      onSelect = props.onSelect,
      onSlideStart = props.onSlideStart,
      onSlideEnd = props.onSlideEnd,
      rest = (0, _objectWithoutPropertiesLoose2.default)(props, ["as", "children", "classPrefix", "className", "placement", "shape", "autoplay", "autoplayInterval", "activeIndex", "defaultActiveIndex", "onSelect", "onSlideStart", "onSlideEnd"]);

  var _useCustom = (0, _utils.useCustom)('Carousel'),
      rtl = _useCustom.rtl;

  var _useClassNames = (0, _utils.useClassNames)(classPrefix),
      prefix = _useClassNames.prefix,
      merge = _useClassNames.merge,
      withClassPrefix = _useClassNames.withClassPrefix;

  var count = _utils.ReactChildren.count(children);

  var labels = [];
  var vertical = placement === 'left' || placement === 'right';
  var lengthKey = vertical ? 'height' : 'width';

  var _useControlled = (0, _utils.useControlled)(activeIndexProp, defaultActiveIndex),
      activeIndex = _useControlled[0],
      setActiveIndex = _useControlled[1];

  var _useState = (0, _react.useState)(0),
      lastIndex = _useState[0],
      setLastIndex = _useState[1];

  var rootRef = (0, _react.useRef)(null); // Set a timer for automatic playback.
  // `autoplay` needs to be cast to boolean type to avoid undefined parameters.

  var _useTimeout = (0, _utils.useTimeout)(function () {
    return handleSlide();
  }, autoplayInterval, !!autoplay && count > 1),
      clear = _useTimeout.clear,
      reset = _useTimeout.reset;

  var handleSlide = (0, _react.useCallback)(function (nextActiveIndex, event) {
    if (!rootRef.current) {
      return;
    }

    clear();
    var index = nextActiveIndex !== null && nextActiveIndex !== void 0 ? nextActiveIndex : activeIndex + 1; // When index is greater than count, start from 1 again.

    var nextIndex = index % count;
    setActiveIndex(nextIndex);
    onSlideStart === null || onSlideStart === void 0 ? void 0 : onSlideStart(nextIndex, event);
    setLastIndex(nextActiveIndex == null ? activeIndex : nextIndex);
    reset();
  }, [activeIndex, count, setActiveIndex, clear, onSlideStart, reset]);

  var handleChange = function handleChange(event) {
    var activeIndex = +event.target.value;
    handleSlide(activeIndex, event);
    onSelect === null || onSelect === void 0 ? void 0 : onSelect(activeIndex, event);
  };

  var handleTransitionEnd = (0, _react.useCallback)(function (event) {
    onSlideEnd === null || onSlideEnd === void 0 ? void 0 : onSlideEnd(activeIndex, event);
  }, [activeIndex, onSlideEnd]);
  var uniqueId = (0, _react.useMemo)(function () {
    return (0, _utils.guid)();
  }, []);

  var items = _react.default.Children.map(children, function (child, index) {
    var _extends2;

    if (!child) {
      return;
    }

    var inputKey = "indicator_" + uniqueId + "_" + index;
    labels.push( /*#__PURE__*/_react.default.createElement("li", {
      key: "label" + index,
      className: prefix('label-wrapper')
    }, /*#__PURE__*/_react.default.createElement("input", {
      name: inputKey,
      id: inputKey,
      type: "radio",
      onChange: handleChange,
      value: index,
      checked: activeIndex === index
    }), /*#__PURE__*/_react.default.createElement("label", {
      htmlFor: inputKey,
      className: prefix('label')
    })));
    return /*#__PURE__*/_react.default.cloneElement(child, {
      key: "slider-item" + index,
      'aria-hidden': activeIndex !== index,
      style: (0, _extends4.default)({}, child.props.style, (_extends2 = {}, _extends2[lengthKey] = 100 / count + "%", _extends2)),
      className: (0, _classnames.default)(prefix('slider-item'), child.props.className)
    });
  });

  var classes = merge(className, withClassPrefix("placement-" + placement, "shape-" + shape));
  var positiveOrder = vertical || !rtl;
  var sign = positiveOrder ? '-' : '';
  var activeRatio = "" + sign + 100 / count * activeIndex + "%";
  var sliderStyles = (_sliderStyles = {}, _sliderStyles[lengthKey] = count * 100 + "%", _sliderStyles.transform = vertical ? "translate3d(0, " + activeRatio + " ,0)" : "translate3d(" + activeRatio + ", 0 ,0)", _sliderStyles);
  var showMask = count > 1 && activeIndex === 0 && activeIndex !== lastIndex;
  return /*#__PURE__*/_react.default.createElement(Component, (0, _extends4.default)({}, rest, {
    ref: (0, _utils.mergeRefs)(ref, rootRef),
    className: classes
  }), /*#__PURE__*/_react.default.createElement("div", {
    className: prefix('content')
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: prefix('slider'),
    style: sliderStyles,
    onTransitionEnd: handleTransitionEnd
  }, items), showMask && /*#__PURE__*/_react.default.createElement("div", {
    className: prefix('slider-after', {
      'slider-after-vertical': vertical
    }),
    style: (_ref = {}, _ref[lengthKey] = '200%', _ref)
  }, [items[items.length - 1], items[0]].map(function (node) {
    var _extends3;

    return /*#__PURE__*/_react.default.cloneElement(node, {
      key: node.key,
      style: (0, _extends4.default)({}, node.props.style, (_extends3 = {}, _extends3[lengthKey] = '50%', _extends3))
    });
  }))), /*#__PURE__*/_react.default.createElement("div", {
    className: prefix('toolbar')
  }, /*#__PURE__*/_react.default.createElement("ul", null, labels)));
});

Carousel.displayName = 'Carousel';
Carousel.propTypes = {
  as: _propTypes.default.elementType,
  className: _propTypes.default.string,
  classPrefix: _propTypes.default.string,
  activeIndex: _propTypes.default.number,
  defaultActiveIndex: _propTypes.default.number,
  autoplay: _propTypes.default.bool,
  autoplayInterval: _propTypes.default.number,
  placement: _propTypes.default.oneOf(['top', 'bottom', 'left', 'right']),
  shape: _propTypes.default.oneOf(['dot', 'bar']),
  onSelect: _propTypes.default.func,
  onSlideStart: _propTypes.default.func,
  onSlideEnd: _propTypes.default.func
};
var _default = Carousel;
exports.default = _default;