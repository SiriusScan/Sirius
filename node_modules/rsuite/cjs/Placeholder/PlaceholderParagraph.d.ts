import { WithAsProps, RsRefForwardingComponent } from '../@types/common';
export interface PlaceholderParagraphProps extends WithAsProps {
    rows?: number;
    rowHeight?: number;
    rowMargin?: number;
    graph?: boolean | 'circle' | 'square' | 'image';
    /** Placeholder status */
    active?: boolean;
}
declare const PlaceholderParagraph: RsRefForwardingComponent<'div', PlaceholderParagraphProps>;
export default PlaceholderParagraph;
