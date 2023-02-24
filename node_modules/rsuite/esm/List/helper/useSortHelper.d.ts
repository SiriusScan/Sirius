import { MouseEventHandler } from 'react';
import { Collection, ManagedItem } from './useManager';
interface MovedItemInfo {
    collection: Collection;
    node: HTMLElement;
    newIndex: number;
    oldIndex: number;
}
export declare type SortConfig = {
    autoScroll?: boolean;
    pressDelay?: number;
    transitionDuration?: number;
    onSortStart?(payload?: MovedItemInfo, event?: MouseEvent): void;
    onSortMove?(payload?: MovedItemInfo, event?: MouseEvent): void;
    onSortEnd?(payload?: MovedItemInfo, event?: MouseEvent): void;
    onSort?(payload?: MovedItemInfo, event?: MouseEvent): void;
};
declare const useSortHelper: (config: SortConfig) => {
    handleStart: MouseEventHandler<Element>;
    handleEnd: MouseEventHandler<Element>;
    containerRef: import("react").RefObject<HTMLDivElement>;
    sorting: boolean;
    register: (item: ManagedItem) => {
        unregister: () => void;
    };
};
export default useSortHelper;
