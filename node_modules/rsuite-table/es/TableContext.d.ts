import React from 'react';
declare type TranslateDOMPositionXYCallback = (style: CSSStyleDeclaration, x?: number, y?: number) => void;
export interface TableContextProps {
    rtl: boolean;
    hasCustomTreeCol: boolean;
    isTree?: boolean;
    translateDOMPositionXY: TranslateDOMPositionXYCallback;
    classPrefix?: string;
}
declare const TableContext: React.Context<TableContextProps>;
export default TableContext;
