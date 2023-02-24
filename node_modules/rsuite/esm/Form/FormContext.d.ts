import React from 'react';
import { TypeAttributes } from '../@types/common';
import type { Schema } from 'schema-typed';
import type { FieldRuleType } from './useSchemaModel';
interface TrulyFormContextValue<T = Record<string, any>, errorMsgType = any, E = {
    [P in keyof T]?: errorMsgType;
}> {
    getCombinedModel: () => Schema;
    formError: E;
    removeFieldValue: (name: string) => void;
    removeFieldError: (name: string) => void;
    pushFieldRule: (name: string, fieldRule: FieldRuleType) => void;
    removeFieldRule: (name: string) => void;
    onFieldChange: (name: string, value: any, event: React.SyntheticEvent) => void;
    onFieldError: (name: string, errorMessage: string) => void;
    onFieldSuccess: (name: string) => void;
}
declare type ExternalPropsContextValue<T> = {
    checkTrigger?: TypeAttributes.CheckTrigger;
    formDefaultValue?: T;
    errorFromContext?: boolean;
    readOnly?: boolean;
    plaintext?: boolean;
    disabled?: boolean;
};
declare type InitialContextType = Partial<Record<keyof TrulyFormContextValue, undefined>>;
export declare type FormContextValue<T = Record<string, any>, errorMsgType = any> = (TrulyFormContextValue<T, errorMsgType> | InitialContextType) & ExternalPropsContextValue<T>;
export declare const FormContext: React.Context<FormContextValue<Record<string, any>, any>>;
export declare const FormValueContext: React.Context<Record<string, any> | undefined>;
export declare const FormPlaintextContext: React.Context<boolean>;
export default FormContext;
