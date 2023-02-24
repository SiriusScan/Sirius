import React, { useContext } from 'react';
import { mergeRefs, useClassNames } from './utils';
import TableContext from './TableContext';
import { StandardProps } from './@types/common';

export interface RowProps extends StandardProps {
  width?: number;
  height?: number;
  headerHeight?: number;
  top?: number;
  isHeaderRow?: boolean;
  rowRef?: any;
  rowSpan?: number;
}

const Row = React.forwardRef((props: RowProps, ref: React.Ref<HTMLDivElement>) => {
  const {
    classPrefix = 'row',
    height = 46,
    headerHeight = 40,
    className,
    width,
    top,
    style,
    isHeaderRow,
    rowRef,
    children,
    rowSpan,
    ...rest
  } = props;

  const { translateDOMPositionXY } = useContext(TableContext);
  const { withClassPrefix, merge } = useClassNames(classPrefix);
  const classes = merge(className, withClassPrefix({ header: isHeaderRow, rowspan: rowSpan }));

  const styles = {
    minWidth: width,
    height: isHeaderRow ? headerHeight : height,
    ...style
  };

  translateDOMPositionXY?.(styles as CSSStyleDeclaration, 0, top);

  return (
    <div role="row" {...rest} ref={mergeRefs(rowRef, ref)} className={classes} style={styles}>
      {children}
    </div>
  );
});

Row.displayName = 'Table.Row';

export default Row;
