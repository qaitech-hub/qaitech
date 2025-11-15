const DotsIcon = ({
  onClick = () => {},
  size = 18,
  fillTailwind = "fill-primary group-hover:fill-primary-hover",
  className = "",
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      style={{ minWidth: size, minHeight: size }}
      width={size}
      height={size}
      fill="none"
      className={`cursor-pointer ${className}`}
      onClick={onClick}
    >
      <path
        className={`${fillTailwind} transition-colors duration-[250ms]`}
        fillRule="evenodd"
        d="M1.5 9a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0ZM7.5 9a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0ZM13.5 9a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z"
        clipRule="evenodd"
      />
    </svg>
  );
};

export default DotsIcon;
