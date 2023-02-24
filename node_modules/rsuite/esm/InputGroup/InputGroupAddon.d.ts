import React from 'react';
import { RsRefForwardingComponent, WithAsProps } from '../@types/common';
export interface InputGroupAddonProps extends WithAsProps, React.HTMLAttributes<HTMLSpanElement> {
    /** An Input group addon can show that it is disabled */
    disabled?: boolean;
}
declare const InputGroupAddon: RsRefForwardingComponent<'span', InputGroupAddonProps>;
export default InputGroupAddon;
