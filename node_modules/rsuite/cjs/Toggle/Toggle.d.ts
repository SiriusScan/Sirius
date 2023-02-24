import React from 'react';
import { WithAsProps, TypeAttributes, RsRefForwardingComponent } from '../@types/common';
import { ToggleLocale } from '../locales';
export interface ToggleProps extends WithAsProps {
    /** Whether to disabled toggle */
    disabled?: boolean;
    /** Render the control as plain text */
    plaintext?: boolean;
    /** Make the control readonly */
    readOnly?: boolean;
    /** Whether the checked state is being updated */
    loading?: boolean;
    /** Checked（Controlled) */
    checked?: boolean;
    /** Default checked */
    defaultChecked?: boolean;
    /** Checked display content */
    checkedChildren?: React.ReactNode;
    /** Unselected display content */
    unCheckedChildren?: React.ReactNode;
    /** Toggle size */
    size?: Omit<TypeAttributes.Size, 'xs'>;
    /** Custom locale */
    locale?: ToggleLocale;
    /** Callback function when state changes */
    onChange?: (checked: boolean, event: React.ChangeEvent<HTMLInputElement>) => void;
}
declare const Toggle: RsRefForwardingComponent<'label', ToggleProps>;
export default Toggle;
