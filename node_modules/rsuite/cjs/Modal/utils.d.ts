/// <reference types="react" />
export declare const useBodyStyles: (ref: React.RefObject<HTMLElement>, options: {
    overflow: boolean;
    drawer: boolean;
    prefix: (...classes: any) => string;
}) => [import("react").CSSProperties, (entering?: boolean) => void, () => void];
