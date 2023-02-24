/// <reference types="react" />
export declare const tuple: <T extends string[]>(...args: T) => T;
export declare type Partial<T> = {
    [P in keyof T]?: T[P];
};
export declare type Pick<T, K extends keyof T> = {
    [P in K]: T[P];
};
export declare type Exclude<T, U> = T extends U ? never : T;
export declare type Omit<T, U> = Pick<T, Exclude<keyof T, keyof U>>;
export declare type ReplaceProps<Inner extends React.ElementType, P> = Omit<React.ComponentPropsWithRef<Inner>, P> & P;
/**
 * Prepend arguments to function
 * Useful for prepend `newValue` arg to native `onChange` callbacks
 *
 * @see https://stackoverflow.com/a/69668215
 * @example
 *
 * type SomeFunc = (a: string, b: number, c: someCustomType) => number;
 * type SomeFuncAltered = PrependParameters<SomeFunc, [d: number]>;
 * // SomeFuncAltered = (d: number, a:string, b:number, c:someCustomType) => number;
 */
export declare type PrependParameters<TFunction extends (...args: any) => any, TParameters extends [...args: any]> = (...args: [...TParameters, ...Parameters<TFunction>]) => ReturnType<TFunction>;
