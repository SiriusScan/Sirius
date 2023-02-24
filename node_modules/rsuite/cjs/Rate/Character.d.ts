import React from 'react';
import { WithAsProps, RsRefForwardingComponent } from '../@types/common';
interface CharacterProps extends WithAsProps {
    vertical?: boolean;
    status?: 0 | 0.5 | 1;
    disabled?: boolean;
    onMouseMove?: (key: any, event: React.MouseEvent) => void;
    onClick?: (key: any, event: React.MouseEvent) => void;
    onKeyDown?: (event: React.KeyboardEvent) => void;
}
declare const Character: RsRefForwardingComponent<'li', CharacterProps>;
export default Character;
