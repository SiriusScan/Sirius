import React from 'react';
import { TypeAttributes } from '../@types/common';
interface Props {
    ref?: React.Ref<any>;
    message?: React.ReactNode;
    children: React.ReactElement | ((props: any, ref: any) => React.ReactElement);
    placement?: TypeAttributes.Placement;
}
export default function appendTooltip({ message, ref, ...rest }: Props): JSX.Element;
export {};
