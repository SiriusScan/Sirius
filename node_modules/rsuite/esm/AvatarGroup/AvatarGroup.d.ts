import React from 'react';
import { TypeAttributes, WithAsProps, RsRefForwardingComponent } from '../@types/common';
export interface AvatarGroupProps extends WithAsProps {
    /** Render all avatars as stacks */
    stack?: boolean;
    /** Set the spacing of the avatar */
    spacing?: number;
    /** Set the size of all avatars. */
    size?: TypeAttributes.Size;
}
export declare const AvatarGroupContext: React.Context<{
    size?: TypeAttributes.Size | undefined;
}>;
declare const AvatarGroup: RsRefForwardingComponent<'div', AvatarGroupProps>;
export default AvatarGroup;
