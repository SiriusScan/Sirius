import React from 'react';
import { TypeAttributes, WithAsProps, RsRefForwardingComponent } from '../@types/common';
export interface AvatarProps extends WithAsProps {
    /** A avatar can have different sizes */
    size?: TypeAttributes.Size;
    /**
     * The `src` attribute for the `img` element.
     */
    src?: string;
    /**
     * The `sizes` attribute for the `img` element.
     */
    sizes?: string;
    /**
     * The `srcSet` attribute for the `img` element.
     * Use this attribute for responsive image display.
     */
    srcSet?: string;
    /**
     * Attributes applied to the `img` element if the component is used to display an image.
     * It can be used to listen for the loading error event.
     */
    imgProps?: React.ImgHTMLAttributes<HTMLImageElement>;
    /** Set avatar shape to circle  */
    circle?: boolean;
    /** This attribute defines an alternative text description of the image */
    alt?: string;
}
declare const Avatar: RsRefForwardingComponent<'div', AvatarProps>;
export default Avatar;
