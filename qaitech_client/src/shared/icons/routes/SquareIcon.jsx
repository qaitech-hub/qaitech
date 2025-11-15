const SquareIcon = ({ active = false }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} fill="none">
      <path
        className={`${
          active ? "stroke-primary" : "stroke-accent-purple"
        } transition-colors duration-[250ms]`}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M14.25 2.25H3.75a1.5 1.5 0 0 0-1.5 1.5v10.5a1.5 1.5 0 0 0 1.5 1.5h10.5a1.5 1.5 0 0 0 1.5-1.5V3.75a1.5 1.5 0 0 0-1.5-1.5Z"
      />
    </svg>
  );
};

export default SquareIcon;
