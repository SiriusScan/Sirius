import { WithAsProps, RsRefForwardingComponent } from '../@types/common';
export interface DividerProps extends WithAsProps {
    /**
     * Vertical dividing line. Cannot be used with text.
     */
    vertical?: boolean;
}
declare const Divider: RsRefForwardingComponent<'div', DividerProps>;
export default Divider;
