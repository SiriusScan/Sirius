import React from 'react';
import { TransitionProps } from './Transition';
export declare enum DIMENSION {
    HEIGHT = "height",
    WIDTH = "width"
}
export interface CollapseProps extends TransitionProps {
    /** The dimension used when collapsing */
    dimension?: DIMENSION | (() => DIMENSION);
    /** Function that returns the height or width of the animating DOM node */
    getDimensionValue?: (dimension: DIMENSION, elem: Element) => number;
}
declare const Collapse: React.ForwardRefExoticComponent<CollapseProps & React.RefAttributes<any>>;
export default Collapse;
