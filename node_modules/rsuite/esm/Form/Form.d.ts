import React from 'react';
import { Schema } from 'schema-typed';
import type { CheckResult } from 'schema-typed';
import FormControl from '../FormControl';
import FormControlLabel from '../FormControlLabel';
import FormErrorMessage from '../FormErrorMessage';
import FormGroup from '../FormGroup';
import FormHelpText from '../FormHelpText';
import { WithAsProps, TypeAttributes, RsRefForwardingComponent } from '../@types/common';
export interface FormProps<T = Record<string, any>, errorMsgType = any, E = {
    [P in keyof T]?: errorMsgType;
}> extends WithAsProps, Omit<React.FormHTMLAttributes<HTMLFormElement>, 'onChange' | 'onSubmit' | 'onError'> {
    /** Set the left and right columns of the layout of the elements within the form */
    layout?: 'horizontal' | 'vertical' | 'inline';
    /** The fluid property allows the Input 100% of the form to fill the container, valid only in vertical layouts. */
    fluid?: boolean;
    /** Current value of the input. Creates a controlled component */
    formValue?: T;
    /** Initial value */
    formDefaultValue?: T;
    /** Error message of form */
    formError?: E;
    /** Trigger the type of form validation */
    checkTrigger?: TypeAttributes.CheckTrigger;
    /** SchemaModel object */
    model?: Schema;
    /** Make the form readonly */
    readOnly?: boolean;
    /** Render the form as plain text */
    plaintext?: boolean;
    /** Disable the form. */
    disabled?: boolean;
    /** The error message comes from context */
    errorFromContext?: boolean;
    /** Callback fired when data changing */
    onChange?: (formValue: T, event?: React.SyntheticEvent) => void;
    /** Callback fired when error checking */
    onError?: (formError: E) => void;
    /** Callback fired when data cheking */
    onCheck?: (formError: E) => void;
    /** Callback fired when form submit */
    onSubmit?: (checkStatus: boolean, event: React.FormEvent<HTMLFormElement>) => void;
}
export interface FormInstance<T = Record<string, any>, errorMsg = string, E = {
    [P in keyof T]?: errorMsg;
}> {
    root: HTMLFormElement | null;
    /** Verify form data */
    check: (callback?: (formError: E) => void) => boolean;
    /** Asynchronously check form data */
    checkAsync: () => Promise<any>;
    /** Check the data field */
    checkForField: (fieldName: keyof T, callback?: (checkResult: CheckResult<errorMsg>) => void) => boolean;
    /** Asynchronous verification as a data field */
    checkForFieldAsync: (fieldName: keyof T) => Promise<CheckResult>;
    /** Clear all error messages */
    cleanErrors: (callback?: () => void) => void;
    /** Clear the error message of the specified field */
    cleanErrorForField: (fieldName: keyof E, callback?: () => void) => void;
    /** All error messages are reset, and an initial value can be set */
    resetErrors: (formError: E, callback?: () => void) => void;
}
export interface FormComponent extends RsRefForwardingComponent<'form', FormProps & {
    ref?: React.Ref<FormInstance>;
}> {
    Control: typeof FormControl;
    ControlLabel: typeof FormControlLabel;
    ErrorMessage: typeof FormErrorMessage;
    Group: typeof FormGroup;
    HelpText: typeof FormHelpText;
}
declare const Form: FormComponent;
export default Form;
