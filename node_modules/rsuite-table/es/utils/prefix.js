import classNames from 'classnames';
import curry from 'lodash/curry';
export function prefix(pre, className) {
  if (!pre || !className) {
    return '';
  }

  if (Array.isArray(className)) {
    return classNames(className.filter(function (name) {
      return !!name;
    }).map(function (name) {
      return pre + "-" + name;
    }));
  } // TODO Compatible with V4


  if (pre[pre.length - 1] === '-') {
    return "" + pre + className;
  }

  return pre + "-" + className;
}
export default curry(prefix);