import React from 'react';
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
declare const Row: React.ForwardRefExoticComponent<RowProps & React.RefAttributes<HTMLDivElement>>;
export default Row;
