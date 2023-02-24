import React from 'react';
import { WithAsProps, RsRefForwardingComponent } from '../@types/common';
export declare type ComponentProps = WithAsProps & React.HTMLAttributes<HTMLDivElement>;
interface Props<TElement extends React.ElementType> extends React.HTMLAttributes<HTMLDivElement> {
    name: string;
    componentAs?: TElement;
    componentClassPrefix?: string;
}
/**
 * Create a component with `classPrefix` and `as` attributes.
 */
declare function createComponent<TElement extends React.ElementType = 'div'>({ name, componentAs, componentClassPrefix, ...defaultProps }: Props<TElement>): RsRefForwardingComponent<TElement, ComponentProps>;
export default createComponent;
