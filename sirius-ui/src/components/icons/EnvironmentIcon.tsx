import React from "react";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  width?: string | number;
  height?: string | number;
  stroke?: string;
}

const EnvironmentIcon: React.FC<IconProps> = ({
  className,
  width = "24px",
  height = "24px",
  stroke = "currentColor",
  ...props
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={width}
    height={height}
    strokeWidth={1}
    stroke={stroke}
    className={className}
    {...props}
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
    <path d="M20 18a2 2 0 1 0 -4 0a2 2 0 0 0 4 0z"></path>
    <path d="M8 18a2 2 0 1 0 -4 0a2 2 0 0 0 4 0z"></path>
    <path d="M8 6a2 2 0 1 0 -4 0a2 2 0 0 0 4 0z"></path>
    <path d="M20 6a2 2 0 1 0 -4 0a2 2 0 0 0 4 0z"></path>
    <path d="M14 12a2 2 0 1 0 -4 0a2 2 0 0 0 4 0z"></path>
    <path d="M6 8v8"></path>
    <path d="M18 16v-8"></path>
    <path d="M8 6h8"></path>
    <path d="M16 18h-8"></path>
    <path d="M7.5 7.5l3 3"></path>
    <path d="M13.5 13.5l3 3"></path>
    <path d="M16.5 7.5l-3 3"></path>
    <path d="M10.5 13.5l-3 3"></path>
  </svg>
);

export default EnvironmentIcon;
