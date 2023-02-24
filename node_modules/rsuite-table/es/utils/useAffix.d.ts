import React from 'react';
import type { ElementOffset } from '../@types/common';
import type { ScrollbarInstance } from '../Scrollbar';
interface AffixProps {
    getTableHeight: () => number;
    contentHeight: React.MutableRefObject<number>;
    affixHeader?: boolean | number;
    affixHorizontalScrollbar?: boolean | number;
    tableOffset: React.RefObject<ElementOffset>;
    headerOffset: React.RefObject<ElementOffset>;
    headerHeight: number;
    scrollbarXRef: React.RefObject<ScrollbarInstance>;
    affixHeaderWrapperRef: React.RefObject<HTMLDivElement>;
}
declare const useAffix: (props: AffixProps) => void;
export default useAffix;
