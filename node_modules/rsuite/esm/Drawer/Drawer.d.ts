import React from 'react';
import { ModalProps, ModalBodyProps, ModalHeaderProps, ModalFooterProps, ModalTitleProps } from '../Modal';
import { TypeAttributes, RsRefForwardingComponent } from '../@types/common';
export interface DrawerProps extends ModalProps {
    /** The placement of Drawer */
    placement?: TypeAttributes.Placement4;
}
declare const DrawerBody: RsRefForwardingComponent<'div', ModalBodyProps>;
declare const DrawerHeader: RsRefForwardingComponent<'div', ModalHeaderProps>;
declare const DrawerActions: RsRefForwardingComponent<'div', ModalFooterProps>;
declare const DrawerFooter: RsRefForwardingComponent<'div', ModalFooterProps>;
declare const DrawerTitle: RsRefForwardingComponent<'div', ModalTitleProps>;
interface DrawerComponent extends React.FC<DrawerProps> {
    Body: typeof DrawerBody;
    Header: typeof DrawerHeader;
    Actions: typeof DrawerActions;
    Title: typeof DrawerTitle;
    /**
     * @deprecated use <Drawer.Actions> instead
     */
    Footer: typeof DrawerFooter;
}
declare const Drawer: DrawerComponent;
export default Drawer;
