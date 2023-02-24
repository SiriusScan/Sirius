"use strict";

exports.__esModule = true;
exports.default = guid;

function guid() {
  return '_' + Math.random().toString(36).substr(2, 12);
}