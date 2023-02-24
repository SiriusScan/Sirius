import scrollTop from 'dom-lib/scrollTop';
import requestAnimationFramePolyfill from 'dom-lib/requestAnimationFramePolyfill';
export default function scrollTopAnimation(target, nextTop, animation, callback) {
  if (animation === void 0) {
    animation = true;
  }

  var top = scrollTop(target);

  var step = function step() {
    scrollTop(target, top > nextTop ? nextTop : top);

    if (top <= nextTop) {
      requestAnimationFramePolyfill(step);
    }

    callback === null || callback === void 0 ? void 0 : callback(top);
    top += 20;
  };

  if (animation) {
    requestAnimationFramePolyfill(step);
  } else {
    scrollTop(target, nextTop);
  }
}