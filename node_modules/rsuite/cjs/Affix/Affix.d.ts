import { RsRefForwardingComponent, WithAsProps } from '../@types/common';
export interface AffixProps extends WithAsProps {
    /** Distance from top */
    top?: number;
    /** Callback after the state changes. */
    onChange?: (fixed?: boolean) => void;
    /** Specify the container. */
    container?: HTMLElement | (() => HTMLElement);
}
declare const Affix: RsRefForwardingComponent<'div', AffixProps>;
export default Affix;
