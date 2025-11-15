export const SuccessIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={16}
      height={16}
      fill="none"
      className="w-[16px] h-[16px] min-w-[16px] min-h-[16px]"
    >
      <g clipPath="url(#asuccess)">
        <path
          fill="#3ECF8E"
          fillRule="evenodd"
          d="M8 .667a7.333 7.333 0 1 0 0 14.667A7.333 7.333 0 0 0 8 .667Zm3.179 6.093a.666.666 0 1 0-1.024-.853l-2.867 3.44-1.483-1.485a.667.667 0 0 0-.943.943l2 2a.665.665 0 0 0 .983-.045l3.334-4Z"
          clipRule="evenodd"
        />
      </g>
      <defs>
        <clipPath id="asuccess">
          <path fill="#fff" d="M0 0h16v16H0z" />
        </clipPath>
      </defs>
    </svg>
  );
};

export const ErrorIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={16}
      height={16}
      fill="none"
      className="w-[16px] h-[16px] min-w-[16px] min-h-[16px]"
    >
      <g clipPath="url(#aerror)">
        <path
          fill="#E24444"
          fillRule="evenodd"
          d="M8 .667a7.333 7.333 0 1 0 0 14.667A7.333 7.333 0 0 0 8 .667Zm2.471 5.805a.666.666 0 0 0-.942-.943L8 7.058 6.471 5.529a.667.667 0 1 0-.942.943L7.057 8 5.53 9.53a.667.667 0 1 0 .942.943L8 8.943l1.529 1.529a.667.667 0 0 0 .942-.943L8.943 8l1.528-1.528Z"
          clipRule="evenodd"
        />
      </g>
      <defs>
        <clipPath id="aerror">
          <path fill="#fff" d="M0 0h16v16H0z" />
        </clipPath>
      </defs>
    </svg>
  );
};
