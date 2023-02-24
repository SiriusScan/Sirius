import React from 'react';
import { WithAsProps, TypeAttributes, FormControlBaseProps } from '../@types/common';
export interface InputNumberProps<T = number | string> extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'defaultValue' | 'onChange' | 'size' | 'prefix'>, WithAsProps, FormControlBaseProps<T> {
    /** Button can have different appearances */
    buttonAppearance?: TypeAttributes.Appearance;
    /** An input can show that it is disabled */
    disabled?: boolean;
    /** Minimum value */
    min?: number;
    /** Maximum value */
    max?: number;
    /** The value of each step. can be decimal */
    step?: number;
    /** Sets the element displayed to the left of the component */
    prefix?: React.ReactNode;
    /** Sets the element displayed on the right side of the component */
    postfix?: React.ReactNode;
    /** An Input can have different sizes */
    size?: TypeAttributes.Size;
    /** Whether the value can be changed through the wheel event */
    scrollable?: boolean;
    onWheel?: (event: React.WheelEvent) => void;
}
declare const InputNumber: React.ForwardRefExoticComponent<InputNumberProps<string | number> & React.RefAttributes<unknown>>;
export default InputNumber;
