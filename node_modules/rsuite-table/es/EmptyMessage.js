import React from 'react';
var EmptyMessage = /*#__PURE__*/React.forwardRef(function (props, ref) {
  var addPrefix = props.addPrefix,
      locale = props.locale,
      renderEmpty = props.renderEmpty,
      loading = props.loading;

  if (loading) {
    return null;
  }

  var emptyMessage = /*#__PURE__*/React.createElement("div", {
    ref: ref,
    className: addPrefix('body-info')
  }, locale === null || locale === void 0 ? void 0 : locale.emptyMessage);
  return renderEmpty ? renderEmpty(emptyMessage) : emptyMessage;
});
EmptyMessage.displayName = 'Table.EmptyMessage';
export default EmptyMessage;