"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = scrollTopAnimation;

var _scrollTop = _interopRequireDefault(require("dom-lib/scrollTop"));

var _requestAnimationFramePolyfill = _interopRequireDefault(require("dom-lib/requestAnimationFramePolyfill"));

function scrollTopAnimation(target, nextTop, animation, callback) {
  if (animation === void 0) {
    animation = true;
  }

  var top = (0, _scrollTop.default)(target);

  var step = function step() {
    (0, _scrollTop.default)(target, top > nextTop ? nextTop : top);

    if (top <= nextTop) {
      (0, _requestAnimationFramePolyfill.default)(step);
    }

    callback === null || callback === void 0 ? void 0 : callback(top);
    top += 20;
  };

  if (animation) {
    (0, _requestAnimationFramePolyfill.default)(step);
  } else {
    (0, _scrollTop.default)(target, nextTop);
  }
}