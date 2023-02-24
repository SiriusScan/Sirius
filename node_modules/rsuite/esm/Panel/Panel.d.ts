import React from 'react';
import { AnimationEventProps, RsRefForwardingComponent, WithAsProps } from '../@types/common';
export interface PanelProps<T = string | number> extends WithAsProps, AnimationEventProps {
    /** Whether it is a collapsible panel */
    collapsible?: boolean;
    /** Show border */
    bordered?: boolean;
    /** With shadow */
    shaded?: boolean;
    /** Content area filled with containers */
    bodyFill?: boolean;
    /** The head displays information. */
    header?: React.ReactNode;
    /** ID */
    id?: string | number;
    /** Expand then panel by default */
    defaultExpanded?: boolean;
    /** Expand then panel */
    expanded?: boolean;
    /** The event key corresponding to the panel. */
    eventKey?: T;
    /** Role of header */
    headerRole?: string;
    /** Role of Panel */
    panelRole?: string;
    /** callback function for the panel clicked */
    onSelect?: (eventKey: T | undefined, event: React.SyntheticEvent) => void;
}
declare const Panel: RsRefForwardingComponent<'div', PanelProps>;
export default Panel;
