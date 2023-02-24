import React from 'react';
import { WithAsProps, FormControlBaseProps, RsRefForwardingComponent } from '../@types/common';
import { ValueType } from '../Radio';
export interface RadioContextProps {
    inline?: boolean;
    name?: string;
    value?: ValueType | null;
    controlled?: boolean;
    disabled?: boolean;
    readOnly?: boolean;
    plaintext?: boolean;
    onChange?: (value: ValueType | undefined, event: React.ChangeEvent<HTMLInputElement>) => void;
}
export interface RadioGroupProps<T = ValueType> extends WithAsProps, FormControlBaseProps<T> {
    /** A radio group can have different appearances */
    appearance?: 'default' | 'picker';
    /** Name to use for form */
    name?: string;
    /** Inline layout */
    inline?: boolean;
    /** Primary content */
    children?: React.ReactNode;
}
export declare const RadioContext: React.Context<RadioContextProps>;
declare const RadioGroup: RsRefForwardingComponent<'div', RadioGroupProps>;
export default RadioGroup;
