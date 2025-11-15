const CheckBox = ({ active = false, onClick = () => {} }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={16}
      height={16}
      fill="none"
      className="cursor-pointer"
      onClick={onClick}
    >
      {active ? (
        <>
          <g clipPath="url(#acheckbox)">
            <path
              className="fill-accent-text"
              fillRule="evenodd"
              d="M8 .667a7.333 7.333 0 1 0 0 14.667A7.333 7.333 0 0 0 8 .667Zm3.179 6.093a.666.666 0 1 0-1.024-.853l-2.867 3.44-1.483-1.485a.667.667 0 0 0-.943.943l2 2a.665.665 0 0 0 .983-.045l3.334-4Z"
              clipRule="evenodd"
            />
          </g>
          <defs>
            <clipPath id="acheckbox">
              <path fill="#fff" d="M0 0h16v16H0z" />
            </clipPath>
          </defs>
        </>
      ) : (
        <path
          className="stroke-primary"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.58}
          d="M8 14.666A6.667 6.667 0 1 0 8 1.333a6.667 6.667 0 0 0 0 13.333Z"
        />
      )}
    </svg>
  );
};

export default CheckBox;
