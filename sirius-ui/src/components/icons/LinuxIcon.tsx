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
    <path d="M12 17c-2.397 -.943 -4 -3.153 -4 -5.635c0 -2.19 1.039 -3.14 1.604 -3.595c2.646 -2.133 6.396 -.27 6.396 3.23c0 2.5 -2.905 2.121 -3.5 1.5c-.595 -.621 -1 -1.5 -.5 -2.5"></path>
    <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"></path>
  </svg>
);

export default WindowsIcon;
