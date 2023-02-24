import PlaceholderGraph from './PlaceholderGraph';
import PlaceholderGrid from './PlaceholderGrid';
import PlaceholderParagraph, { PlaceholderParagraphProps } from './PlaceholderParagraph';
import { RsRefForwardingComponent } from '../@types/common';
export interface Placeholder extends RsRefForwardingComponent<'div', PlaceholderParagraphProps> {
    Paragraph: typeof PlaceholderParagraph;
    Grid: typeof PlaceholderGrid;
    Graph: typeof PlaceholderGraph;
}
declare const Placeholder: Placeholder;
export default Placeholder;
