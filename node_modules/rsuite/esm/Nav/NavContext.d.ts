import React from 'react';
export interface NavContextProps {
    activeKey: string | undefined;
    onSelect?: (eventKey: string | undefined, event: React.SyntheticEvent) => void;
}
declare const NavContext: React.Context<NavContextProps | null>;
export default NavContext;
