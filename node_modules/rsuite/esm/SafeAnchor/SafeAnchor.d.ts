import React from 'react';
import { WithAsProps, RsRefForwardingComponent } from '../@types/common';
export interface SafeAnchorProps extends WithAsProps, React.HTMLAttributes<HTMLElement> {
    /** Link specified url */
    href?: string;
    /** A link can show it is currently unable to be interacted with */
    disabled?: boolean;
}
declare const SafeAnchor: RsRefForwardingComponent<'a', SafeAnchorProps>;
export default SafeAnchor;
