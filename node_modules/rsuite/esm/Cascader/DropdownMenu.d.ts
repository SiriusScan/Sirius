import React from 'react';
import PropTypes from 'prop-types';
import { ItemDataType, WithAsProps, RsRefForwardingComponent } from '../@types/common';
import { ValueType } from './Cascader';
export interface DropdownMenuProps extends Omit<WithAsProps, 'classPrefix'> {
    classPrefix: string;
    disabledItemValues: ValueType[];
    activeItemValue?: ValueType | null;
    childrenKey: string;
    cascadeData: ItemDataType[][];
    cascadePaths: ItemDataType[];
    valueKey: string;
    labelKey: string;
    menuWidth?: number;
    menuHeight?: number | string;
    renderMenuItem?: (itemLabel: React.ReactNode, item: ItemDataType) => React.ReactNode;
    renderMenu?: (items: ItemDataType[], menu: React.ReactNode, parentNode?: ItemDataType, layer?: number) => React.ReactNode;
    onSelect?: (node: ItemDataType, cascadePaths: ItemDataType[], isLeafNode: boolean, event: React.MouseEvent) => void;
}
declare const DropdownMenu: RsRefForwardingComponent<'div', DropdownMenuProps>;
export declare const dropdownMenuPropTypes: {
    classPrefix: PropTypes.Requireable<string>;
    disabledItemValues: PropTypes.Requireable<any[]>;
    activeItemValue: PropTypes.Requireable<any>;
    childrenKey: PropTypes.Requireable<string>;
    valueKey: PropTypes.Requireable<string>;
    labelKey: PropTypes.Requireable<string>;
    menuWidth: PropTypes.Requireable<number>;
    menuHeight: PropTypes.Requireable<string | number>;
    className: PropTypes.Requireable<string>;
    renderMenuItem: PropTypes.Requireable<(...args: any[]) => any>;
    renderMenu: PropTypes.Requireable<(...args: any[]) => any>;
    onSelect: PropTypes.Requireable<(...args: any[]) => any>;
    cascadeData: PropTypes.Requireable<any[]>;
    cascadePaths: PropTypes.Requireable<any[]>;
};
export default DropdownMenu;
