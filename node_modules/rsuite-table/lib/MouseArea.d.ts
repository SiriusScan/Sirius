import React from 'react';
interface MouseAreaProps extends React.HTMLAttributes<HTMLDivElement> {
    addPrefix: (...classes: any) => string;
    height: number;
    headerHeight: number;
}
declare const MouseArea: React.ForwardRefExoticComponent<MouseAreaProps & React.RefAttributes<HTMLDivElement>>;
export default MouseArea;
