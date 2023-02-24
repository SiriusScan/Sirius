import React from 'react';
import NavItem from './NavItem';
import { WithAsProps, RsRefForwardingComponent } from '../@types/common';
import NavDropdown from './NavDropdown';
import NavMenu from './NavMenu';
export interface NavProps<T = any> extends WithAsProps, Omit<React.HTMLAttributes<HTMLElement>, 'onSelect'> {
    /** sets appearance */
    appearance?: 'default' | 'subtle' | 'tabs';
    /** Reverse Direction of tabs/subtle */
    reversed?: boolean;
    /** Justified navigation */
    justified?: boolean;
    /** Vertical navigation */
    vertical?: boolean;
    /** appears on the right. */
    pullRight?: boolean;
    /** Active key, corresponding to eventkey in <Nav.item>. */
    activeKey?: T;
    /** Callback function triggered after selection */
    onSelect?: (eventKey: T | undefined, event: React.SyntheticEvent) => void;
}
interface NavComponent extends RsRefForwardingComponent<'div', NavProps> {
    /**
     * @deprecated Use <Nav.Menu> instead.
     */
    Dropdown: typeof NavDropdown;
    Item: typeof NavItem;
    Menu: typeof NavMenu;
}
declare const Nav: NavComponent;
export default Nav;
