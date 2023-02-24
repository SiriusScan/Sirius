import React from 'react';
import { WithAsProps, RsRefForwardingComponent } from '../@types/common';
export declare type PlacementType = 'topCenter' | 'bottomCenter' | 'topStart' | 'topEnd' | 'bottomStart' | 'bottomEnd';
export declare const toastPlacements: PlacementType[];
export interface ToastContainerProps extends WithAsProps {
    /** The placement of the message box */
    placement?: PlacementType;
    /** Set the message to appear in the specified container */
    container?: HTMLElement | (() => HTMLElement);
    /** The number of milliseconds to wait before automatically closing a message. */
    duration?: number;
    callback?: (ref: React.RefObject<ToastContainerInstance>) => void;
}
interface PushOptions {
    duration?: number;
}
export interface ToastContainerInstance {
    root: HTMLElement;
    push: (message: React.ReactNode, options?: PushOptions) => string;
    remove: (key: string) => void;
    clear: () => void;
    destroy: () => void;
}
export interface NodeProps extends WithAsProps {
    onClose?: (event?: React.MouseEvent<HTMLDivElement>) => void;
}
interface ToastContainerComponent extends RsRefForwardingComponent<'div', ToastContainerProps> {
    getInstance: (props: ToastContainerProps) => Promise<[React.RefObject<ToastContainerInstance>, () => void]>;
}
declare const ToastContainer: ToastContainerComponent;
export default ToastContainer;
