import React from 'react';
import { SliderProps } from '../Slider';
export declare type Range = [number, number];
export declare type RangeSliderProps = SliderProps<Range> & {
    /**
     * Add constraint to validate before onChange is dispatched
     */
    constraint?: (range: Range) => boolean;
};
declare const RangeSlider: React.ForwardRefExoticComponent<SliderProps<Range> & {
    /**
     * Add constraint to validate before onChange is dispatched
     */
    constraint?: ((range: Range) => boolean) | undefined;
} & React.RefAttributes<unknown>>;
export default RangeSlider;
