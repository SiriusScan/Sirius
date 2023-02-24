/// <reference types="react" />
import { PickerLocale } from '../locales';
export interface SelectedElementProps {
    selectedItems: any[];
    valueKey: string;
    labelKey: string;
    countable: boolean;
    cascade?: boolean;
    locale?: PickerLocale;
    childrenKey?: string;
    prefix: (name: string) => string;
}
declare const SelectedElement: (props: SelectedElementProps) => JSX.Element;
export default SelectedElement;
