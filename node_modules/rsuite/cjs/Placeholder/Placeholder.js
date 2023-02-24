"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = void 0;

var _PlaceholderGraph = _interopRequireDefault(require("./PlaceholderGraph"));

var _PlaceholderGrid = _interopRequireDefault(require("./PlaceholderGrid"));

var _PlaceholderParagraph = _interopRequireDefault(require("./PlaceholderParagraph"));

var Placeholder = _PlaceholderParagraph.default;
Placeholder.Paragraph = _PlaceholderParagraph.default;
Placeholder.Grid = _PlaceholderGrid.default;
Placeholder.Graph = _PlaceholderGraph.default;
var _default = Placeholder;
exports.default = _default;