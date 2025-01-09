import React from "react";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  width?: string | number;
  height?: string | number;
  stroke?: string;
}

const WindowsIcon: React.FC<IconProps> = ({
  className,
  width = "24px",
  height = "24px",
  stroke = "currentColor",
  strokeWidth = 1,
  ...props
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={width}
    height={height}
    strokeWidth={strokeWidth}
    stroke={stroke}
    className={className}
    {...props}
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
    <path d="M17.8 20l-12 -1.5c-1 -.1 -1.8 -.9 -1.8 -1.9v-9.2c0 -1 .8 -1.8 1.8 -1.9l12 -1.5c1.2 -.1 2.2 .8 2.2 1.9v12.1c0 1.2 -1.1 2.1 -2.2 1.9z"></path>
    <path d="M12 5l0 14"></path>
    <path d="M4 12l16 0"></path>
  </svg>
);

export default WindowsIcon;
