import { WithAsProps, RsRefForwardingComponent } from '../@types/common';
interface ProgressBarProps extends WithAsProps {
    vertical?: boolean;
    rtl?: boolean;
    start?: number;
    end?: number;
}
declare const ProgressBar: RsRefForwardingComponent<'div', ProgressBarProps>;
export default ProgressBar;
