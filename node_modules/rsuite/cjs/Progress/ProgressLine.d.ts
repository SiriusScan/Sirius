import { WithAsProps, RsRefForwardingComponent } from '../@types/common';
export interface ProgressLineProps extends WithAsProps {
    /** Line color */
    strokeColor?: string;
    /** Percent of progress */
    percent?: number;
    /** Line width */
    strokeWidth?: number;
    /** Trail color */
    trailColor?: string;
    /** Trail width */
    trailWidth?: number;
    /** Show text */
    showInfo?: boolean;
    /** Progress status */
    status?: 'success' | 'fail' | 'active';
    /**  The progress bar is displayed vertically */
    vertical?: boolean;
}
declare const ProgressLine: RsRefForwardingComponent<'div', ProgressLineProps>;
export default ProgressLine;
