import React from 'react';
import { WithAsProps, RsRefForwardingComponent } from '../@types/common';
export interface CarouselProps extends WithAsProps {
    /** Autoplay element */
    autoplay?: boolean;
    /** Autoplay interval */
    autoplayInterval?: number;
    /** Button placement */
    placement?: 'top' | 'bottom' | 'left' | 'right';
    /** Button shape */
    shape?: 'dot' | 'bar';
    /** Active element index */
    activeIndex?: number;
    /** Defaul initial index */
    defaultActiveIndex?: number;
    /** Callback fired when the active item manually changes */
    onSelect?: (index: number, event: React.ChangeEvent<HTMLInputElement>) => void;
    /** Callback fired when a slide transition starts */
    onSlideStart?: (index: number, event?: React.ChangeEvent<HTMLInputElement>) => void;
    /** Callback fired when a slide transition ends */
    onSlideEnd?: (index: number, event: React.TransitionEvent<HTMLDivElement>) => void;
}
declare const Carousel: RsRefForwardingComponent<'div', CarouselProps>;
export default Carousel;
