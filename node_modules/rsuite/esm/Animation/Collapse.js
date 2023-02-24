import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import getStyle from 'dom-lib/getStyle';
import addStyle from 'dom-lib/addStyle';
import get from 'lodash/get';
import capitalize from 'lodash/capitalize';
import Transition, { transitionPropTypes } from './Transition';
import { useClassNames, createChainedFunction } from '../utils';
export var DIMENSION;

(function (DIMENSION) {
  DIMENSION["HEIGHT"] = "height";
  DIMENSION["WIDTH"] = "width";
})(DIMENSION || (DIMENSION = {}));

var triggerBrowserReflow = function triggerBrowserReflow(node) {
  return get(node, 'offsetHeight');
};

var MARGINS = {
  height: ['marginTop', 'marginBottom'],
  width: ['marginLeft', 'marginRight']
};

function defaultGetDimensionValue(dimension, elem) {
  var value = get(elem, "offset" + capitalize(dimension));
  var margins = MARGINS[dimension];
  return value + parseInt(getStyle(elem, margins[0]), 10) + parseInt(getStyle(elem, margins[1]), 10);
}

function getScrollDimensionValue(elem, dimension) {
  var value = get(elem, "scroll" + capitalize(dimension));
  return value + "px";
}

var Collapse = /*#__PURE__*/React.forwardRef(function (props, ref) {
  var className = props.className,
      _props$timeout = props.timeout,
      timeout = _props$timeout === void 0 ? 300 : _props$timeout,
      _props$dimension = props.dimension,
      dimensionProp = _props$dimension === void 0 ? DIMENSION.HEIGHT : _props$dimension,
      exitedClassName = props.exitedClassName,
      exitingClassName = props.exitingClassName,
      enteredClassName = props.enteredClassName,
      enteringClassName = props.enteringClassName,
      _props$getDimensionVa = props.getDimensionValue,
      getDimensionValue = _props$getDimensionVa === void 0 ? defaultGetDimensionValue : _props$getDimensionVa,
      onEnter = props.onEnter,
      onEntering = props.onEntering,
      onEntered = props.onEntered,
      onExit = props.onExit,
      onExiting = props.onExiting,
      rest = _objectWithoutPropertiesLoose(props, ["className", "timeout", "dimension", "exitedClassName", "exitingClassName", "enteredClassName", "enteringClassName", "getDimensionValue", "onEnter", "onEntering", "onEntered", "onExit", "onExiting"]);

  var _useClassNames = useClassNames('anim'),
      prefix = _useClassNames.prefix,
      merge = _useClassNames.merge;

  var dimension = typeof dimensionProp === 'function' ? dimensionProp() : dimensionProp;
  var handleEnter = useCallback(function (elem) {
    addStyle(elem, dimension, 0);
  }, [dimension]);
  var handleEntering = useCallback(function (elem) {
    addStyle(elem, dimension, getScrollDimensionValue(elem, dimension));
  }, [dimension]);
  var handleEntered = useCallback(function (elem) {
    addStyle(elem, dimension, 'auto');
  }, [dimension]);
  var handleExit = useCallback(function (elem) {
    var value = getDimensionValue ? getDimensionValue(dimension, elem) : 0;
    addStyle(elem, dimension, value + "px");
  }, [dimension, getDimensionValue]);
  var handleExiting = useCallback(function (elem) {
    triggerBrowserReflow(elem);
    addStyle(elem, dimension, 0);
  }, [dimension]);
  return /*#__PURE__*/React.createElement(Transition, _extends({}, rest, {
    ref: ref,
    timeout: timeout,
    className: merge(className, prefix({
      'collapse-horizontal': dimension === 'width'
    })),
    exitedClassName: exitedClassName || prefix('collapse'),
    exitingClassName: exitingClassName || prefix('collapsing'),
    enteredClassName: enteredClassName || prefix('collapse', 'in'),
    enteringClassName: enteringClassName || prefix('collapsing'),
    onEnter: createChainedFunction(handleEnter, onEnter),
    onEntering: createChainedFunction(handleEntering, onEntering),
    onEntered: createChainedFunction(handleEntered, onEntered),
    onExit: createChainedFunction(handleExit, onExit),
    onExiting: createChainedFunction(handleExiting, onExiting)
  }));
});
Collapse.displayName = 'Collapse';
Collapse.propTypes = _extends({}, transitionPropTypes, {
  dimension: PropTypes.any,
  getDimensionValue: PropTypes.func
});
export default Collapse;