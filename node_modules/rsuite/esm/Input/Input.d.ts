import React from 'react';
import { WithAsProps, RsRefForwardingComponent, TypeAttributes, FormControlBaseProps } from '../@types/common';
import { PrependParameters } from '../@types/utils';
export interface LocaleType {
    unfilled: string;
}
export interface InputProps extends WithAsProps, Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'size'>, Omit<FormControlBaseProps, 'onChange'> {
    /** The HTML input type */
    type?: string;
    /** The HTML input id */
    id?: string;
    /** A component can have different sizes */
    size?: TypeAttributes.Size;
    /** Ref of input element */
    inputRef?: React.Ref<any>;
    onChange?: PrependParameters<React.ChangeEventHandler<HTMLInputElement>, [value: string]>;
    /** Called on press enter */
    onPressEnter?: React.KeyboardEventHandler<HTMLInputElement>;
}
declare const Input: RsRefForwardingComponent<'input', InputProps>;
export default Input;
