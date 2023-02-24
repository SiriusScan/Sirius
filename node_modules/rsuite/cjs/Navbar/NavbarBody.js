"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = void 0;

var _createComponent = _interopRequireDefault(require("../utils/createComponent"));

var _deprecateComponent = _interopRequireDefault(require("../utils/deprecateComponent"));

var NavbarBody = (0, _createComponent.default)({
  name: 'NavbarBody'
});

var _default = (0, _deprecateComponent.default)(NavbarBody, '<Navbar.Body> has been deprecated, you should <Nav> as direct child of <Navbar>');

exports.default = _default;