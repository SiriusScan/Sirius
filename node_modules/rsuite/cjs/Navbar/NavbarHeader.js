"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = void 0;

var _createComponent = _interopRequireDefault(require("../utils/createComponent"));

var _deprecateComponent = _interopRequireDefault(require("../utils/deprecateComponent"));

var NavbarHeader = (0, _createComponent.default)({
  name: 'NavbarHeader'
});

var _default = (0, _deprecateComponent.default)(NavbarHeader, '<Navbar.Header> has been deprecated, use <Navbar.Brand> instead.');

exports.default = _default;