import React from 'react';
import { PickerLocale } from '../locales';
import { PickerComponent } from '../Picker';
import { FormControlPickerProps, ItemDataType } from '../@types/common';
export declare type ValueType = (number | string)[];
export interface MultiCascaderProps<T = ValueType> extends FormControlPickerProps<T, PickerLocale, ItemDataType> {
    cascade?: boolean;
    /** A picker that can be counted */
    countable?: boolean;
    /** Sets the width of the menu */
    menuWidth?: number;
    /** Sets the height of the menu */
    menuHeight?: number | string;
    /** Set the option value for the check box not to be rendered */
    uncheckableItemValues?: T;
    /** Whether dispaly search input box */
    searchable?: boolean;
    /** The menu is displayed directly when the component is initialized */
    inline?: boolean;
    /** Custom render menu */
    renderMenu?: (items: ItemDataType[], menu: React.ReactNode, parentNode?: any, layer?: number) => React.ReactNode;
    /** Custom render menu items */
    renderMenuItem?: (itemLabel: React.ReactNode, item: any) => React.ReactNode;
    /** Custom render selected items */
    renderValue?: (value: T, selectedItems: ItemDataType[], selectedElement: React.ReactNode) => React.ReactNode;
    /** Called when the option is selected */
    onSelect?: (node: ItemDataType, cascadePaths: ItemDataType[], event: React.SyntheticEvent) => void;
    /** Called after the checkbox state changes */
    onCheck?: (value: ValueType, node: ItemDataType, checked: boolean, event: React.SyntheticEvent) => void;
    /** Called when clean */
    onClean?: (event: React.SyntheticEvent) => void;
    /** Called when searching */
    onSearch?: (searchKeyword: string, event: React.SyntheticEvent) => void;
    /** Asynchronously load the children of the tree node. */
    getChildren?: (node: ItemDataType) => ItemDataType[] | Promise<ItemDataType[]>;
}
declare const MultiCascader: PickerComponent<MultiCascaderProps>;
export default MultiCascader;
