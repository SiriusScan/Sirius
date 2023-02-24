import { WithAsProps, RsRefForwardingComponent } from '../@types/common';
export interface PlaceholderGridProps extends WithAsProps {
    rows?: number;
    rowHeight?: number;
    rowMargin?: number;
    columns?: number;
    /** Placeholder status */
    active?: boolean;
}
declare const PlaceholderGrid: RsRefForwardingComponent<'div', PlaceholderGridProps>;
export default PlaceholderGrid;
