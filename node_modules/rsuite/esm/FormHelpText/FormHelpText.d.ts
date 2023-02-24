import { WithAsProps, RsRefForwardingComponent } from '../@types/common';
export interface FormHelpTextProps extends WithAsProps {
    /** Whether to show through the Tooltip component */
    tooltip?: boolean;
}
declare const FormHelpText: RsRefForwardingComponent<'span', FormHelpTextProps>;
export default FormHelpText;
