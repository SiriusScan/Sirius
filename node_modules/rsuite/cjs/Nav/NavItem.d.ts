import React from 'react';
import { RsRefForwardingComponent, WithAsProps } from '../@types/common';
import { IconProps } from '@rsuite/icons/lib/Icon';
export interface NavItemProps<T = string> extends WithAsProps, Omit<React.HTMLAttributes<HTMLElement>, 'onSelect'> {
    /** Activation status */
    active?: boolean;
    /** Disabled status */
    disabled?: boolean;
    /** divier for nav item */
    divider?: boolean;
    /** display panel */
    panel?: boolean;
    /** Sets the icon for the component */
    icon?: React.ReactElement<IconProps>;
    /** The value of the current option */
    eventKey?: T;
    /** Providing a `href` will render an `<a>` element */
    href?: string;
    /** Select the callback function that the event triggers. */
    onSelect?: (eventKey: T | undefined, event: React.SyntheticEvent) => void;
}
/**
 * The <Nav.Item> API
 * When used as direct child of <Nav>, render the NavItem
 * When used within a <Nav.Menu>, render the NavDropdownItem
 */
declare const NavItem: RsRefForwardingComponent<'a', NavItemProps>;
export default NavItem;
