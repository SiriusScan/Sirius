//Operating System Icon component that displays the OS icon based on the OS name
//Uses fontawesome icons

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWindows, faApple, faLinux } from '@fortawesome/free-brands-svg-icons';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';

interface OperatingSystemIconProps {
  osName: string;
}

const OperatingSystemIcon: React.FC<OperatingSystemIconProps> = ({ size, osName }) => {
  const getIcon = (os: string) => {
    if (os?.toLowerCase().includes('windows')) {
      return faWindows;
    } else if (os?.toLowerCase().includes('mac') || os?.toLowerCase().includes('apple')) {
      return faApple;
    } else if (os?.toLowerCase().includes('linux')) {
      return faLinux;
    } else {
      return faQuestionCircle;
    }
  };

  const icon = getIcon(osName);
  return icon ? <FontAwesomeIcon size={size} icon={icon} /> : null;
};

export default OperatingSystemIcon;