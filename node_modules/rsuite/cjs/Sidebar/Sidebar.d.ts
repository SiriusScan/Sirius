import { WithAsProps, RsRefForwardingComponent } from '../@types/common';
export interface SidebarProps extends WithAsProps {
    /** Width */
    width?: number | string;
    /** Sidebar can be collapsed */
    collapsible?: boolean;
}
declare const Sidebar: RsRefForwardingComponent<'aside', SidebarProps>;
export default Sidebar;
