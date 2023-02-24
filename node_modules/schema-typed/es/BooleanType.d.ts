import { MixedType } from './MixedType';
import { ErrorMessageType } from './types';
import { BooleanTypeLocale } from './locales';
export declare class BooleanType<DataType = any, E = ErrorMessageType> extends MixedType<boolean, DataType, E, BooleanTypeLocale> {
    constructor(errorMessage?: E | string);
}
export default function getBooleanType<DataType = any, E = string>(errorMessage?: E): BooleanType<DataType, E>;
