import React from 'react';
import { Column } from './getColumnProps';
declare function getTotalByColumns(columns: Column | React.ReactNode[]): {
    totalFlexGrow: number;
    totalWidth: number;
};
export default getTotalByColumns;
