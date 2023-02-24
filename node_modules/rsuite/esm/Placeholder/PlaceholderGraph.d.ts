import { WithAsProps, RsRefForwardingComponent } from '../@types/common';
export interface PlaceholderGraphProps extends WithAsProps {
    height?: number;
    width?: number;
    /** Placeholder status */
    active?: boolean;
}
declare const PlaceholderGraph: RsRefForwardingComponent<'div', PlaceholderGraphProps>;
export default PlaceholderGraph;
