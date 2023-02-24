import React from 'react';
import { WithAsProps } from '../@types/common';
declare type KeyType = string | number;
export interface PanelGroupProps<T = KeyType> extends WithAsProps {
    /** Whether it is a collapsible panel. */
    accordion?: boolean;
    /** Expand the Panel, corresponding to the 'Panel' of 'eventkey' */
    activeKey?: T;
    /** Show border */
    bordered?: boolean;
    /** The default expansion panel. */
    defaultActiveKey?: T;
    /** Primary content */
    children?: React.ReactNode;
    /** Toggles the callback function for the expand panel */
    onSelect?: (eventKey: T | undefined, event: React.SyntheticEvent) => void;
}
interface PanelGroupContext {
    accordion?: boolean;
    activeKey?: KeyType;
    onGroupSelect?: (activeKey: KeyType | undefined, event: React.MouseEvent) => void;
}
export declare const PanelGroupContext: React.Context<PanelGroupContext>;
declare const PanelGroup: React.ForwardRefExoticComponent<PanelGroupProps<KeyType> & React.RefAttributes<unknown>>;
export default PanelGroup;
