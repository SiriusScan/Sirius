import React from 'react';
import { RsRefForwardingComponent, WithAsProps } from '../@types/common';
import { CheckStateType } from '../utils';
export interface CheckTreeNodeProps extends WithAsProps {
    rtl?: boolean;
    label?: any;
    layer: number;
    value?: any;
    focus?: boolean;
    style?: React.CSSProperties;
    expand?: boolean;
    loading?: boolean;
    visible?: boolean;
    nodeData?: any;
    disabled?: boolean;
    className?: string;
    checkState?: CheckStateType;
    classPrefix?: string;
    hasChildren?: boolean;
    uncheckable?: boolean;
    allUncheckable?: boolean;
    onExpand?: (nodeData: any) => void;
    onSelect?: (nodeData: any, event: React.SyntheticEvent) => void;
    onRenderTreeIcon?: (nodeData: any, expandIcon?: React.ReactNode) => React.ReactNode;
    onRenderTreeNode?: (nodeData: any) => React.ReactNode;
}
declare const CheckTreeNode: RsRefForwardingComponent<'div', CheckTreeNodeProps>;
export default CheckTreeNode;
