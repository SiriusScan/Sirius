import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import isNil from 'lodash/isNil';
import Star from '@rsuite/icons/legacy/Star';
import { useClassNames, useControlled, shallowEqualArray, SIZE, KEY_VALUES } from '../utils';
import { transformValueToCharacterMap, transformCharacterMapToValue } from './utils';
import Character from './Character';
import Plaintext from '../Plaintext';
var Rate = /*#__PURE__*/React.forwardRef(function (props, ref) {
  var _props$as = props.as,
      Component = _props$as === void 0 ? 'ul' : _props$as,
      _props$character = props.character,
      character = _props$character === void 0 ? /*#__PURE__*/React.createElement(Star, null) : _props$character,
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
      rest = _objectWithoutPropertiesLoose(props, ["as", "character", "className", "classPrefix", "disabled", "max", "readOnly", "vertical", "size", "color", "allowHalf", "value", "defaultValue", "cleanable", "plaintext", "onChange", "renderCharacter", "onChangeActive"]);

  var _useControlled = useControlled(valueProp, defaultValue),
      value = _useControlled[0],
      setValue = _useControlled[1];

  var getCharacterMap = useCallback(function (v) {
    return transformValueToCharacterMap(typeof v !== 'undefined' ? v : value, max, allowHalf);
  }, [allowHalf, max, value]);

  var _useState = useState(getCharacterMap()),
      characterMap = _useState[0],
      setCharacterMap = _useState[1];

  var hoverValue = transformCharacterMapToValue(characterMap);

  var _useClassNames = useClassNames(classPrefix),
      merge = _useClassNames.merge,
      withClassPrefix = _useClassNames.withClassPrefix;

  var classes = merge(className, withClassPrefix(size, color, {
    disabled: disabled,
    readonly: readOnly
  }));
  var resetCharacterMap = useCallback(function () {
    setCharacterMap(getCharacterMap());
  }, [getCharacterMap]);
  useEffect(function () {
    // Update characterMap when value is updated.
    setCharacterMap(getCharacterMap(valueProp)); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valueProp]);
  var handleMouseLeave = useCallback(function (event) {
    resetCharacterMap();
    onChangeActive === null || onChangeActive === void 0 ? void 0 : onChangeActive(value, event);
  }, [onChangeActive, resetCharacterMap, value]);
  var handleChangeValue = useCallback(function (index, event) {
    var nextValue = transformCharacterMapToValue(characterMap);

    if (cleanable && value === nextValue && getCharacterMap(value)[index] === characterMap[index]) {
      nextValue = 0;
    }

    if (nextValue !== value) {
      setValue(nextValue);
      setCharacterMap(getCharacterMap(nextValue));
      onChange === null || onChange === void 0 ? void 0 : onChange(nextValue, event);
    }
  }, [characterMap, cleanable, getCharacterMap, onChange, setValue, value]);
  var handleKeyDown = useCallback(function (index, event) {
    var key = event.key;
    var nextValue = transformCharacterMapToValue(characterMap);

    if (key === KEY_VALUES.RIGHT && nextValue < max) {
      nextValue = allowHalf ? nextValue + 0.5 : nextValue + 1;
    } else if (key === KEY_VALUES.LEFT && nextValue > 0) {
      nextValue = allowHalf ? nextValue - 0.5 : nextValue - 1;
    }

    setCharacterMap(getCharacterMap(nextValue));

    if (key === KEY_VALUES.ENTER) {
      handleChangeValue(index, event);
    }
  }, [allowHalf, characterMap, getCharacterMap, handleChangeValue, max]);
  var handleChangeCharacterMap = useCallback(function (index, key, event) {
    var nextCharacterMap = characterMap.map(function (_item, i) {
      if (i === index && key === 'before' && allowHalf) {
        return 0.5;
      }

      return index >= i ? 1 : 0;
    });

    if (!shallowEqualArray(characterMap, nextCharacterMap)) {
      setCharacterMap(nextCharacterMap);
      onChangeActive === null || onChangeActive === void 0 ? void 0 : onChangeActive(transformCharacterMapToValue(nextCharacterMap), event);
    }
  }, [allowHalf, characterMap, onChangeActive]);
  var handleClick = useCallback(function (index, key, event) {
    handleChangeCharacterMap(index, key, event);
    handleChangeValue(index, event);
  }, [handleChangeCharacterMap, handleChangeValue]);

  if (plaintext) {
    return /*#__PURE__*/React.createElement(Plaintext, {
      localeKey: "notSelected",
      className: className
    }, !isNil(value) ? value + "(" + max + ")" : null);
  }

  return /*#__PURE__*/React.createElement(Component, _extends({
    role: "radiogroup",
    tabIndex: 0
  }, rest, {
    ref: ref,
    className: classes,
    onMouseLeave: handleMouseLeave
  }), characterMap.map(function (item, index) {
    return /*#__PURE__*/React.createElement(Character, {
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
  allowHalf: PropTypes.bool,
  character: PropTypes.node,
  classPrefix: PropTypes.string,
  cleanable: PropTypes.bool,
  defaultValue: PropTypes.number,
  disabled: PropTypes.bool,
  max: PropTypes.number,
  renderCharacter: PropTypes.func,
  readOnly: PropTypes.bool,
  size: PropTypes.oneOf(SIZE),
  value: PropTypes.number,
  vertical: PropTypes.bool,
  onChange: PropTypes.func,
  onChangeActive: PropTypes.func
};
export default Rate;