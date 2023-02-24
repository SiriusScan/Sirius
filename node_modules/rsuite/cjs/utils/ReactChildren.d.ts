import React from 'react';
export declare function find(children: React.ReactNode, func: any, context?: any): React.ReactNode;
export declare function map(children: React.ReactNode, func: any, context?: any): any[] | null | undefined;
export declare function mapCloneElement(children: React.ReactNode, func: any, context?: any): any[] | null | undefined;
export declare function count(children: React.ReactChildren): number;
declare function some(children: React.ReactNode, func: any, context?: any): boolean;
declare const _default: {
    mapCloneElement: typeof mapCloneElement;
    count: typeof count;
    some: typeof some;
    map: typeof map;
    find: typeof find;
};
export default _default;
