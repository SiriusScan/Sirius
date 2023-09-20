import React from "react";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  width?: string | number;
  height?: string | number;
  fill?: string;
}

const HostsIcon: React.FC<IconProps> = ({
  className,
  width = "24px",
  height = "24px",
  fill = "currentColor",
  ...props
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 -960 960 960"
    width={width}
    height={height}
    className={className}
    {...props}
  >
    <path
      d="M80-160v-120h80v-440q0-33 23.5-56.5T240-800h600v80H240v440h240v120H80Zm520 0q-17 0-28.5-11.5T560-200v-400q0-17 11.5-28.5T600-640h240q17 0 28.5 11.5T880-600v400q0 17-11.5 28.5T840-160H600Zm40-120h160v-280H640v280Zm0 0h160-160Z"
      fill={fill}
    />
  </svg>
);

export default HostsIcon;
