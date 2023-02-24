import React from 'react';
import { TableLocaleType } from './@types/common';
interface EmptyMessageProps extends React.HTMLAttributes<HTMLDivElement> {
    locale?: TableLocaleType;
    loading?: boolean;
    addPrefix: (...classes: any) => string;
    renderEmpty?: (info: React.ReactNode) => any;
}
declare const EmptyMessage: React.ForwardRefExoticComponent<EmptyMessageProps & React.RefAttributes<HTMLDivElement>>;
export default EmptyMessage;
