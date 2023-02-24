import { WithAsProps, TypeAttributes, RsRefForwardingComponent } from '../@types/common';
export interface ButtonGroupProps extends WithAsProps {
    /** Display block buttongroups */
    block?: boolean;
    /** A button can show it is currently unable to be interacted with */
    disabled?: boolean;
    /** Vertical layouts of button */
    vertical?: boolean;
    /** Horizontal constant width layout */
    justified?: boolean;
    /**
     * An ARIA role describing the button group. Usually the default
     * "group" role is fine. An `aria-label` or `aria-labelledby`
     * prop is also recommended.
     */
    role?: string;
    /** A button group can have different sizes */
    size?: TypeAttributes.Size;
}
declare const ButtonGroup: RsRefForwardingComponent<'div', ButtonGroupProps>;
export default ButtonGroup;
