import React from 'react';
import { WithAsProps } from '../@types/common';
export declare type ValueType = string | number;
export interface RadioProps<T = ValueType> extends WithAsProps, Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
    /** HTML title */
    title?: string;
    /** The disable of component */
    disabled?: boolean;
    /** Make the control readonly */
    readOnly?: boolean;
    /** Render the control as plain text */
    plaintext?: boolean;
    /** Specifies whether the radio is selected */
    checked?: boolean;
    /** Specifies the initial state: whether or not the radio is selected */
    defaultChecked?: boolean;
    /** Attributes applied to the input element. */
    inputProps?: React.HTMLAttributes<HTMLInputElement>;
    /** Pass a ref to the input element */
    inputRef?: React.Ref<HTMLInputElement>;
    /** Value, corresponding to the value of the Radiogroup, to determine whether the */
    value?: T;
    /** Name to use for form */
    name?: string;
    /** Inline layout */
    inline?: boolean;
    /** Primary content */
    children?: React.ReactNode;
    /** Callback function with value changed */
    onChange?: (value: T | undefined, checked: boolean, event: React.ChangeEvent<HTMLInputElement>) => void;
}
declare const Radio: React.ForwardRefExoticComponent<RadioProps<ValueType> & React.RefAttributes<unknown>>;
export default Radio;
