import React from 'react';
import NavbarBody from './NavbarBody';
import NavbarHeader from './NavbarHeader';
import NavbarBrand from './NavbarBrand';
import { WithAsProps, RsRefForwardingComponent } from '../@types/common';
export declare const NavbarContext: React.Context<boolean>;
declare type AppearanceType = 'default' | 'inverse' | 'subtle';
export interface NavbarProps extends WithAsProps {
    appearance?: AppearanceType;
    classPrefix?: string;
}
interface NavbarComponent extends RsRefForwardingComponent<'div', NavbarProps> {
    /**
     * @deprecated use Navbar.Brand instead
     */
    Header: typeof NavbarHeader;
    /**
     * @deprecated use Nav as direct child of Navbar
     */
    Body: typeof NavbarBody;
    Brand: typeof NavbarBrand;
}
declare const Navbar: NavbarComponent;
export default Navbar;
