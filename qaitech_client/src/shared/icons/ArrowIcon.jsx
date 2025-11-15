const ArrowIcon = ({
  active = false,
  color = "stroke-accent-purple",
  size = 12,
  pointer = false,
  onClick = () => {},
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      fill="none"
      style={{
        minWidth: size,
        minHeight: size,
        cursor: pointer ? "pointer" : "default",
      }}
      className={`transition-transform group duration-[250ms] ${
        active ? "rotate-180" : "rotate-0"
      }`}
      viewBox="0 0 12 12"
      onClick={onClick}
    >
      <path
        className={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="m2 4.5 4 4 4-4"
      />
    </svg>
  );
};

export default ArrowIcon;
