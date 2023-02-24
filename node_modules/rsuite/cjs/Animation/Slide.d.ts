import React from 'react';
import { TransitionProps } from './Transition';
export interface SlideProps extends TransitionProps {
    placement?: 'top' | 'right' | 'bottom' | 'left';
}
declare const Slide: React.ForwardRefExoticComponent<SlideProps & React.RefAttributes<any>>;
export default Slide;
