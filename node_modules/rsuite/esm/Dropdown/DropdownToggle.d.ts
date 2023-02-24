import React from 'react';
import Button from '../Button';
import { IconProps } from '@rsuite/icons/lib/Icon';
import { WithAsProps, RsRefForwardingComponent, TypeAttributes } from '../@types/common';
export interface DropdownToggleProps extends WithAsProps {
    icon?: React.ReactElement<IconProps>;
    noCaret?: boolean;
    renderToggle?: (props: WithAsProps, ref: React.Ref<any>) => any;
    placement?: TypeAttributes.Placement8;
}
declare const DropdownToggle: RsRefForwardingComponent<typeof Button, DropdownToggleProps>;
export default DropdownToggle;
