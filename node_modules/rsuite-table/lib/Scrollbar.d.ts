import React from 'react';
import type { StandardProps } from './@types/common';
export interface ScrollbarProps extends Omit<StandardProps, 'onScroll'> {
    vertical?: boolean;
    length: number;
    scrollLength: number;
    tableId?: string;
    onScroll?: (delta: number, event: React.MouseEvent) => void;
    onMouseDown?: (event: React.MouseEvent) => void;
}
export interface ScrollbarInstance {
    root: HTMLDivElement;
    handle: HTMLDivElement;
    onWheelScroll: (delta: number, momentum?: boolean) => void;
    resetScrollBarPosition: (forceDelta?: number) => void;
}
declare const Scrollbar: React.ForwardRefExoticComponent<ScrollbarProps & React.RefAttributes<unknown>>;
export default Scrollbar;
