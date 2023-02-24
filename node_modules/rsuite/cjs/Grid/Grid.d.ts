import { WithAsProps, RsRefForwardingComponent } from '../@types/common';
export interface GridProps extends WithAsProps {
    /** Fluid layout */
    fluid?: boolean;
}
declare const Grid: RsRefForwardingComponent<'div', GridProps>;
export default Grid;
