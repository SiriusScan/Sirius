import React, { useContext } from 'react';
import { useClassNames } from './utils';
import TableContext from './TableContext';

export interface CellGroupProps {
  fixed?: 'left' | 'right';
  width?: number;
  height?: number;
  left?: number;
  style?: React.CSSProperties;
  className?: string;
  classPrefix?: string;
  children?: React.ReactNode;
}

const CellGroup = React.forwardRef((props: CellGroupProps, ref: React.Ref<HTMLDivElement>) => {
  const {
    fixed,
    width,
    left,
    height,
    style,
    classPrefix = 'cell-group',
    className,
    children,
    ...rest
  } = props;

  const { translateDOMPositionXY } = useContext(TableContext);
  const { withClassPrefix, merge } = useClassNames(classPrefix);
  const classes = merge(className, withClassPrefix({ [`fixed-${fixed}`]: fixed, scroll: !fixed }));

  const styles = {
    width,
    height,
    ...style
  };

  translateDOMPositionXY?.(styles as CSSStyleDeclaration, left, 0);

  return (
    <div {...rest} ref={ref} className={classes} style={styles}>
      {children}
    </div>
  );
});

CellGroup.displayName = 'Table.CellGroup';

export default CellGroup;
