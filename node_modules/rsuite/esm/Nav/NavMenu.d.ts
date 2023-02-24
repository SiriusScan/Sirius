import React, { Dispatch } from 'react';
import { NavDropdownProps } from './NavDropdown';
import { NavDropdownMenuProps } from './NavDropdownMenu';
export interface NavMenuProps extends NavDropdownProps, Omit<NavDropdownMenuProps, 'onToggle'> {
}
export declare type NavMenuState = {
    items: {
        _id: any;
        eventKey?: any;
        active: boolean;
    }[];
};
export declare type NavMenuContextProps = [NavMenuState, Dispatch<NavMenuAction>];
export declare const NavMenuContext: React.Context<NavMenuContextProps | null>;
export declare enum NavMenuActionType {
    RegisterItem = 0,
    UnregisterItem = 1
}
export declare type NavMenuAction = {
    type: NavMenuActionType.RegisterItem;
    payload: {
        _id: any;
        eventKey?: any;
        active: boolean;
    };
} | {
    type: NavMenuActionType.UnregisterItem;
    payload: {
        _id: any;
    };
};
/**
 * The <Nav.Menu> API
 * When used as direct child of <Nav>, render the NavDropdown
 * When used within another <Nav.Menu>, render the NavDropdownMenu
 */
declare const NavMenu: React.ForwardRefExoticComponent<NavMenuProps & React.RefAttributes<any>>;
export default NavMenu;
