import React from 'react';
import { WithAsProps, FormControlBaseProps, RsRefForwardingComponent } from '../@types/common';
import type { ValueType } from '../Checkbox';
export interface CheckboxGroupProps<V = ValueType[]> extends WithAsProps, FormControlBaseProps<V> {
    /** Used for the name of the form */
    name?: string;
    /** Primary content */
    children?: React.ReactNode;
    /** Inline layout */
    inline?: boolean;
}
declare const CheckboxGroup: RsRefForwardingComponent<'div', CheckboxGroupProps>;
export default CheckboxGroup;
