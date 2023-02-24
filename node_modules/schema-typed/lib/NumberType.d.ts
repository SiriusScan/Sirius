import { MixedType } from './MixedType';
import { ErrorMessageType } from './types';
import { NumberTypeLocale } from './locales';
export declare class NumberType<DataType = any, E = ErrorMessageType> extends MixedType<number | string, DataType, E, NumberTypeLocale> {
    constructor(errorMessage?: E | string);
    isInteger(errorMessage?: E | string): this;
    pattern(regexp: RegExp, errorMessage?: E | string): this;
    isOneOf(values: number[], errorMessage?: E | string): this;
    range(min: number, max: number, errorMessage?: E | string): this;
    min(min: number, errorMessage?: E | string): this;
    max(max: number, errorMessage?: E | string): this;
}
export default function getNumberType<DataType = any, E = string>(errorMessage?: E): NumberType<DataType, E>;
