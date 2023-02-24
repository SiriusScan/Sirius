import React from 'react';
import { WithAsProps, RsRefForwardingComponent } from '../@types/common';
export interface FormControlLabelProps extends WithAsProps, React.LabelHTMLAttributes<HTMLLabelElement> {
    /** Attribute of the html label tag, defaults to the controlId of the FormGroup */
    htmlFor?: string;
}
declare const FormControlLabel: RsRefForwardingComponent<'label', FormControlLabelProps>;
export default FormControlLabel;
