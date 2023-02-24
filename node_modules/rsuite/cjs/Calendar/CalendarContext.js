"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

exports.__esModule = true;
exports.useCalendarContext = exports.CalendarProvider = exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

var CalendarContext = /*#__PURE__*/_react.default.createContext({});

var _default = CalendarContext;
exports.default = _default;
var CalendarProvider = CalendarContext.Provider;
exports.CalendarProvider = CalendarProvider;

var useCalendarContext = function useCalendarContext() {
  return (0, _react.useContext)(CalendarContext) || {};
};

exports.useCalendarContext = useCalendarContext;