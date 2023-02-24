import React from 'react';
import { WithAsProps, RsRefForwardingComponent } from '../@types/common';
export interface SearchBarProps extends WithAsProps {
    value?: string;
    placeholder?: string;
    className?: string;
    inputRef?: React.Ref<HTMLInputElement>;
    onChange?: (value: string, event: React.ChangeEvent<HTMLInputElement>) => void;
}
declare const SearchBar: RsRefForwardingComponent<'div', SearchBarProps>;
export default SearchBar;
