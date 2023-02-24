import { WithAsProps, RsRefForwardingComponent } from '../@types/common';
export interface FlexboxGridItemProps extends WithAsProps {
    /** spacing between grids */
    colspan?: number;
    /** grid orders for sorting */
    order?: number;
}
declare const FlexboxGridItem: RsRefForwardingComponent<'div', FlexboxGridItemProps>;
export default FlexboxGridItem;
