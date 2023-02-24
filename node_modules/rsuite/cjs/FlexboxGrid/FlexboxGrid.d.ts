import FlexboxGridItem from './FlexboxGridItem';
import { WithAsProps, RsRefForwardingComponent } from '../@types/common';
export interface FlexboxGridProps extends WithAsProps {
    /** align */
    align?: 'top' | 'middle' | 'bottom';
    /** horizontal arrangement */
    justify?: 'start' | 'end' | 'center' | 'space-around' | 'space-between';
}
interface FlexboxGridCompont extends RsRefForwardingComponent<'div', FlexboxGridProps> {
    Item: typeof FlexboxGridItem;
}
declare const FlexboxGrid: FlexboxGridCompont;
export default FlexboxGrid;
