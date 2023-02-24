import classNames from 'classnames';
export declare type ClassValue = string | number | ClassDictionary | ClassArray | undefined | null | boolean;
export interface ClassArray extends Array<ClassValue> {
}
export interface ClassDictionary {
    [id: string]: any;
}
/**
 * Add a prefix to all classNames.
 *
 * @param str prefix of className
 * @returns { withClassPrefix, merge, prefix }
 *  - withClassPrefix: A function of combining className and adding a prefix to each className.
 *    At the same time, the default `classPrefix` is the first className.
 *  - merge: A merge className function.
 *  - prefix: Add a prefix to className
 *  - rootPrefix
 */
declare function useClassNames(str: string): {
    withClassPrefix: (...classes: ClassValue[]) => string;
    merge: typeof classNames;
    prefix: (...classes: ClassValue[]) => string;
    rootPrefix: (...classes: ClassValue[]) => string;
};
export default useClassNames;
