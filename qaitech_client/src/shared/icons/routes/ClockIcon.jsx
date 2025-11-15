import React from "react";

const ClockIcon = ({ active = false }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} fill="none">
      <g
        className={`${
          active ? "stroke-primary" : "stroke-accent-purple"
        } transition-colors duration-[250ms]`}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        clipPath="url(#aclock)"
      >
        <path d="M9 1.5a7.5 7.5 0 1 0 0 15 7.5 7.5 0 0 0 0-15Z" />
        <path d="m11.25 12-1.81-1.81A1.5 1.5 0 0 1 9 9.129V4.5" />
      </g>
      <defs>
        <clipPath id="aclock">
          <path
            className={`${
              active ? "fill-primary" : "fill-accent-purple"
            } transition-colors duration-[250ms]`}
            d="M0 0h18v18H0z"
          />
        </clipPath>
      </defs>
    </svg>
  );
};

export default ClockIcon;
