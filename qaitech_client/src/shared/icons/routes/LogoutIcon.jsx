import React from "react";

const LogoutIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={18}
      height={18}
      viewBox="0 0 24 24"
    >
      <g
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        className="stroke-accent-purple group-hover:stroke-danger transition-colors duration-[250ms]"
      >
        <path d="M14 8V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2v-2"></path>
        <path d="M9 12h12l-3-3m0 6l3-3"></path>
      </g>
    </svg>
  );
};

export default LogoutIcon;
