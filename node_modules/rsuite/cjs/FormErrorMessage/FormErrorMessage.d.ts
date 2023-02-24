import { TypeAttributes, WithAsProps, RsRefForwardingComponent } from '../@types/common';
export interface FormErrorMessageProps extends WithAsProps {
    /** Show error messages */
    show?: boolean;
    /** The placement of error messages */
    placement?: TypeAttributes.Placement8;
}
declare const FormErrorMessage: RsRefForwardingComponent<'div', FormErrorMessageProps>;
export default FormErrorMessage;
