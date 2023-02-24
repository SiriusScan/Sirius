import { MixedType } from './MixedType';
import { ErrorMessageType } from './types';
import { DateTypeLocale } from './locales';
export declare class DateType<DataType = any, E = ErrorMessageType> extends MixedType<string | Date, DataType, E, DateTypeLocale> {
    constructor(errorMessage?: E | string);
    range(min: string | Date, max: string | Date, errorMessage?: E | string): this;
    min(min: string | Date, errorMessage?: E | string): this;
    max(max: string | Date, errorMessage?: E | string): this;
}
export default function getDateType<DataType = any, E = string>(errorMessage?: E): DateType<DataType, E>;
