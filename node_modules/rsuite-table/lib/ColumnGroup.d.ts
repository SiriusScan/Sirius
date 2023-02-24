import React from 'react';
import { StandardProps } from './@types/common';
export interface ColumnGroupProps extends StandardProps {
    /** Alignment */
    align?: 'left' | 'center' | 'right';
    /** Vertical alignment */
    verticalAlign?: 'top' | 'middle' | 'bottom';
    /** Fixed column */
    fixed?: boolean | 'left' | 'right';
    /**
     * The height of the header of the merged cell group.
     * The default value is the square value of the table `headerHeight` value.
     **/
    groupHeaderHeight?: number;
    /** Group header */
    header?: React.ReactNode;
    width?: number;
    headerHeight?: number;
}
declare const ColumnGroup: React.ForwardRefExoticComponent<ColumnGroupProps & React.RefAttributes<HTMLDivElement>>;
export default ColumnGroup;
