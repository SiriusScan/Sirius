import React from 'react';
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
declare const CellGroup: React.ForwardRefExoticComponent<CellGroupProps & React.RefAttributes<HTMLDivElement>>;
export default CellGroup;
