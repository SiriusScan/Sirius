import React from 'react';
import { WithAsProps, RsRefForwardingComponent } from '../@types/common';
export declare type ValueType = string | number;
export interface CheckboxProps<V = ValueType> extends WithAsProps {
    /** HTML title */
    title?: string;
    /** Inline layout */
    inline?: boolean;
    /** A checkbox can appear disabled and be unable to change states */
    disabled?: boolean;
    /** Make the control readonly */
    readOnly?: boolean;
    /** Render the control as plain text */
    plaintext?: boolean;
    /** Whether or not checkbox is checked. */
    checked?: boolean;
    /** The initial value of checked. */
    defaultChecked?: boolean;
    /** Whether or not checkbox is indeterminate. */
    indeterminate?: boolean;
    /** Attributes applied to the input element. */
    inputProps?: React.HTMLAttributes<HTMLInputElement>;
    /** Pass a ref to the input element. */
    inputRef?: React.Ref<any>;
    /** The HTML input value. */
    value?: V;
    /** A checkbox can receive focus. */
    tabIndex?: number;
    /** Whether to show checkbox */
    checkable?: boolean;
    /** Used for the name of the form */
    name?: string;
    /** Called when the user attempts to change the checked state. */
    onChange?: (value: V | undefined, checked: boolean, event: React.ChangeEvent<HTMLInputElement>) => void;
    /** Called when the checkbox or label is clicked. */
    onClick?: (event: React.SyntheticEvent) => void;
    /** Called when the checkbox is clicked. */
    onCheckboxClick?: (event: React.SyntheticEvent) => void;
}
declare const Checkbox: RsRefForwardingComponent<'div', CheckboxProps>;
export default Checkbox;
