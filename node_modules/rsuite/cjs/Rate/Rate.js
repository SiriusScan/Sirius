"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _isNil = _interopRequireDefault(require("lodash/isNil"));

var _Star = _interopRequireDefault(require("@rsuite/icons/legacy/Star"));

var _utils = require("../utils");

var _utils2 = require("./utils");

var _Character = _interopRequireDefault(require("./Character"));

var _Plaintext = _interopRequireDefault(require("../Plaintext"));

var Rate = /*#__PURE__*/_react.default.forwardRef(function (props, ref) {
  var _props$as = props.as,
      Component = _props$as === void 0 ? 'ul' : _props$as,
      _props$character = props.character,
      character = _props$character === void 0 ? /*#__PURE__*/_react.default.createElement(_Star.default, null) : _props$character,
      className = props.className,
      _props$classPrefix = props.classPrefix,
      classPrefix = _props$classPrefix === void 0 ? 'rate' : _props$classPrefix,
      disabled = props.disabled,
      _props$max = props.max,
      max = _props$max === void 0 ? 5 : _props$max,
      readOnly = props.readOnly,
      vertical = props.vertical,
      _props$size = props.size,
      size = _props$size === void 0 ? 'md' : _props$size,
      color = props.color,
      _props$allowHalf = props.allowHalf,
      allowHalf = _props$allowHalf === void 0 ? false : _props$allowHalf,
      valueProp = props.value,
      _props$defaultValue = props.defaultValue,
      defaultValue = _props$defaultValue === void 0 ? 0 : _props$defaultValue,
      _props$cleanable = props.cleanable,
      cleanable = _props$cleanable === void 0 ? true : _props$cleanable,
      plaintext = props.plaintext,
      onChange = props.onChange,
      renderCharacter = props.renderCharacter,
      onChangeActive = props.onChangeActive,
      rest = (0, _objectWithoutPropertiesLoose2.default)(props, ["as", "character", "className", "classPrefix", "disabled", "max", "readOnly", "vertical", "size", "color", "allowHalf", "value", "defaultValue", "cleanable", "plaintext", "onChange", "renderCharacter", "onChangeActive"]);

  var _useControlled = (0, _utils.useControlled)(valueProp, defaultValue),
      value = _useControlled[0],
      setValue = _useControlled[1];

  var getCharacterMap = (0, _react.useCallback)(function (v) {
    return (0, _utils2.transformValueToCharacterMap)(typeof v !== 'undefined' ? v : value, max, allowHalf);
  }, [allowHalf, max, value]);

  var _useState = (0, _react.useState)(getCharacterMap()),
      characterMap = _useState[0],
      setCharacterMap = _useState[1];

  var hoverValue = (0, _utils2.transformCharacterMapToValue)(characterMap);

  var _useClassNames = (0, _utils.useClassNames)(classPrefix),
      merge = _useClassNames.merge,
      withClassPrefix = _useClassNames.withClassPrefix;

  var classes = merge(className, withClassPrefix(size, color, {
    disabled: disabled,
    readonly: readOnly
  }));
  var resetCharacterMap = (0, _react.useCallback)(function () {
    setCharacterMap(getCharacterMap());
  }, [getCharacterMap]);
  (0, _react.useEffect)(function () {
    // Update characterMap when value is updated.
    setCharacterMap(getCharacterMap(valueProp)); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valueProp]);
  var handleMouseLeave = (0, _react.useCallback)(function (event) {
    resetCharacterMap();
    onChangeActive === null || onChangeActive === void 0 ? void 0 : onChangeActive(value, event);
  }, [onChangeActive, resetCharacterMap, value]);
  var handleChangeValue = (0, _react.useCallback)(function (index, event) {
    var nextValue = (0, _utils2.transformCharacterMapToValue)(characterMap);

    if (cleanable && value === nextValue && getCharacterMap(value)[index] === characterMap[index]) {
      nextValue = 0;
    }

    if (nextValue !== value) {
      setValue(nextValue);
      setCharacterMap(getCharacterMap(nextValue));
      onChange === null || onChange === void 0 ? void 0 : onChange(nextValue, event);
    }
  }, [characterMap, cleanable, getCharacterMap, onChange, setValue, value]);
  var handleKeyDown = (0, _react.useCallback)(function (index, event) {
    var key = event.key;
    var nextValue = (0, _utils2.transformCharacterMapToValue)(characterMap);

    if (key === _utils.KEY_VALUES.RIGHT && nextValue < max) {
      nextValue = allowHalf ? nextValue + 0.5 : nextValue + 1;
    } else if (key === _utils.KEY_VALUES.LEFT && nextValue > 0) {
      nextValue = allowHalf ? nextValue - 0.5 : nextValue - 1;
    }

    setCharacterMap(getCharacterMap(nextValue));

    if (key === _utils.KEY_VALUES.ENTER) {
      handleChangeValue(index, event);
    }
  }, [allowHalf, characterMap, getCharacterMap, handleChangeValue, max]);
  var handleChangeCharacterMap = (0, _react.useCallback)(function (index, key, event) {
    var nextCharacterMap = characterMap.map(function (_item, i) {
      if (i === index && key === 'before' && allowHalf) {
        return 0.5;
      }

      return index >= i ? 1 : 0;
    });

    if (!(0, _utils.shallowEqualArray)(characterMap, nextCharacterMap)) {
      setCharacterMap(nextCharacterMap);
      onChangeActive === null || onChangeActive === void 0 ? void 0 : onChangeActive((0, _utils2.transformCharacterMapToValue)(nextCharacterMap), event);
    }
  }, [allowHalf, characterMap, onChangeActive]);
  var handleClick = (0, _react.useCallback)(function (index, key, event) {
    handleChangeCharacterMap(index, key, event);
    handleChangeValue(index, event);
  }, [handleChangeCharacterMap, handleChangeValue]);

  if (plaintext) {
    return /*#__PURE__*/_react.default.createElement(_Plaintext.default, {
      localeKey: "notSelected",
      className: className
    }, !(0, _isNil.default)(value) ? value + "(" + max + ")" : null);
  }

  return /*#__PURE__*/_react.default.createElement(Component, (0, _extends2.default)({
    role: "radiogroup",
    tabIndex: 0
  }, rest, {
    ref: ref,
    className: classes,
    onMouseLeave: handleMouseLeave
  }), characterMap.map(function (item, index) {
    return /*#__PURE__*/_react.default.createElement(_Character.default, {
      role: "radio",
      "aria-posinset": index + 1,
      "aria-setsize": max,
      "aria-checked": value === index + 1,
      key: index,
      status: item,
      disabled: disabled || readOnly,
      vertical: vertical,
      onClick: function onClick(key, event) {
        return handleClick(index, key, event);
      },
      onKeyDown: function onKeyDown(event) {
        return handleKeyDown(index, event);
      },
      onMouseMove: function onMouseMove(key, event) {
        return handleChangeCharacterMap(index, key, event);
      }
    }, renderCharacter ? renderCharacter(hoverValue, index) : character);
  }));
});

Rate.displayName = 'Rate';
Rate.propTypes = {
  allowHalf: _propTypes.default.bool,
  character: _propTypes.default.node,
  classPrefix: _propTypes.default.string,
  cleanable: _propTypes.default.bool,
  defaultValue: _propTypes.default.number,
  disabled: _propTypes.default.bool,
  max: _propTypes.default.number,
  renderCharacter: _propTypes.default.func,
  readOnly: _propTypes.default.bool,
  size: _propTypes.default.oneOf(_utils.SIZE),
  value: _propTypes.default.number,
  vertical: _propTypes.default.bool,
  onChange: _propTypes.default.func,
  onChangeActive: _propTypes.default.func
};
var _default = Rate;
exports.default = _default;