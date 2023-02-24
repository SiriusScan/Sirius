import React from 'react';
import { WithAsProps } from '../@types/common';
export declare type ContainerProps = WithAsProps & React.HTMLAttributes<HTMLDivElement>;
export declare const ContainerContext: React.Context<ContainerContextValue>;
interface ContainerContextValue {
    setHasSidebar?: (value: boolean) => void;
}
declare const Container: React.ForwardRefExoticComponent<WithAsProps<React.ElementType<any>> & React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
export default Container;
