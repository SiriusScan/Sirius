import ProgressCircle from './ProgressCircle';
import ProgressLine, { ProgressLineProps } from './ProgressLine';
import { RsRefForwardingComponent } from '../@types/common';
export interface Progress extends RsRefForwardingComponent<'div', ProgressLineProps> {
    Line: typeof ProgressLine;
    Circle: typeof ProgressCircle;
}
declare const Progress: Progress;
export default Progress;
