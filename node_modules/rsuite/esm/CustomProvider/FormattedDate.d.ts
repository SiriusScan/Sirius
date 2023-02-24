/// <reference types="react" />
interface FormattedDateProps {
    date: Date;
    formatStr: string;
}
declare function FormattedDate({ date, formatStr }: FormattedDateProps): JSX.Element;
export default FormattedDate;
