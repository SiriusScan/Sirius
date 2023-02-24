export default (function (node) {
  if (!node) {
    throw new TypeError('No Element passed to `getComputedStyle()`');
  }

  var doc = node.ownerDocument;

  if ('defaultView' in doc) {
    if (doc.defaultView.opener) {
      return node.ownerDocument.defaultView.getComputedStyle(node, null);
    }

    return window.getComputedStyle(node, null);
  }

  return null;
});