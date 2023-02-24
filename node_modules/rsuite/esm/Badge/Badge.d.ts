import React from 'react';
import { WithAsProps, RsRefForwardingComponent, TypeAttributes } from '../@types/common';
export interface BadgeProps extends WithAsProps {
    /** Main content */
    content?: React.ReactNode;
    /** Max count */
    maxCount?: number;
    /** A badge can have different colors */
    color?: TypeAttributes.Color;
}
declare const Badge: RsRefForwardingComponent<'div', BadgeProps>;
export default Badge;
