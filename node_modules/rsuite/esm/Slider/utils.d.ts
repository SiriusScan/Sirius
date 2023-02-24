export declare const precisionMath: (value: any) => number;
declare function checkValue<T extends number | undefined>(value: T, min: number, max: number): T extends undefined ? undefined : number;
export { checkValue };
