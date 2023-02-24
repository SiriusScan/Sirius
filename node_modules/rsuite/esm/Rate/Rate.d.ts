import React from 'react';
import { WithAsProps, TypeAttributes, RsRefForwardingComponent, FormControlBaseProps } from '../@types/common';
export interface RateProps<T = number> extends WithAsProps, FormControlBaseProps<T> {
    allowHalf?: boolean;
    character?: React.ReactNode;
    classPrefix?: string;
    cleanable?: boolean;
    /** A tate can have different sizes */
    size?: TypeAttributes.Size;
    /** A tate can have different colors */
    color?: TypeAttributes.Color;
    max?: number;
    vertical?: boolean;
    renderCharacter?: (value: number, index: number) => React.ReactNode;
    onChangeActive?: (value: T, event: React.SyntheticEvent) => void;
}
declare const Rate: RsRefForwardingComponent<'ul', RateProps>;
export default Rate;
