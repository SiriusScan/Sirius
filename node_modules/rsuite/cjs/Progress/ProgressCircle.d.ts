import { WithAsProps, RsRefForwardingComponent } from '../@types/common';
export interface ProgressCircleProps extends WithAsProps {
    /** Line color */
    strokeColor?: string;
    /** The end of different types of open paths */
    strokeLinecap?: 'butt' | 'round' | 'square';
    /** Tail color */
    trailColor?: string;
    /** Percent of progress */
    percent?: number;
    /** Line width */
    strokeWidth?: number;
    /** Tail width */
    trailWidth?: number;
    /** Circular progress bar degree */
    gapDegree?: number;
    /** Circular progress bar Notch position */
    gapPosition?: 'top' | 'bottom' | 'left' | 'right';
    /** Show text */
    showInfo?: boolean;
    /** Progress status */
    status?: 'success' | 'fail' | 'active';
}
declare const ProgressCircle: RsRefForwardingComponent<'div', ProgressCircleProps>;
export default ProgressCircle;
