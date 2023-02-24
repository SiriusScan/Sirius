import React from 'react';
import { WithAsProps, RsRefForwardingComponent, TypeAttributes } from '../@types/common';
export interface LoaderProps extends WithAsProps {
    /** Centered in the container */
    center?: boolean;
    /** Whether the background is displayed */
    backdrop?: boolean;
    /** An alternative dark visual style for the Loader */
    inverse?: boolean;
    /** The icon is displayed vertically with the text */
    vertical?: boolean;
    /** Custom descriptive text */
    content?: React.ReactNode;
    /** The speed at which the loader rotates */
    speed?: 'normal' | 'fast' | 'slow';
    /** A loader can have different sizes */
    size?: TypeAttributes.Size;
}
declare const Loader: RsRefForwardingComponent<'div', LoaderProps>;
export default Loader;
