import React from 'react';
var MouseArea = /*#__PURE__*/React.forwardRef(function (props, ref) {
  var addPrefix = props.addPrefix,
      headerHeight = props.headerHeight,
      height = props.height;
  var styles = {
    height: height
  };
  var spanStyles = {
    height: headerHeight - 1
  };
  return /*#__PURE__*/React.createElement("div", {
    ref: ref,
    className: addPrefix('mouse-area'),
    style: styles
  }, /*#__PURE__*/React.createElement("span", {
    style: spanStyles
  }));
});
MouseArea.displayName = 'Table.MouseArea';
export default MouseArea;