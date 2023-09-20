"use client";
import React from "react";

interface DashNumberCardProps {
  title: string;
  number: number;
  color: string;
  icon: React.ReactNode;
}

const DashNumberCard: React.FC<DashNumberCardProps> = ({
  title,
  number,
  color,
  icon,
}) => {
  return (
    <div
      style={{ borderBottom: `2px solid ${color}` }}
      className="flex w-44 flex-col items-center justify-center p-4"
    >
      <div className="flex h-12 w-12 items-center justify-center">
        <span className="text-5xl font-extralight text-gray-700 dark:text-gray-300">
          {number}
        </span>
      </div>
      <div className="mt-2 flex flex-row items-center justify-center">
        <span className="flex items-center justify-center gap-2 text-sm font-semibold text-gray-500 dark:text-gray-400">
          {icon} {title}
        </span>
      </div>
    </div>
  );
};

export default DashNumberCard;
