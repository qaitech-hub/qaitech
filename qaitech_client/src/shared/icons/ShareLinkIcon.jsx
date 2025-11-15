const ShareLinkIcon = ({
  onClick = () => {},
  size = 18,
  strokeTailwind = "stroke-primary group-hover:stroke-primary-hover",
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      style={{ minWidth: size, minHeight: size }}
      width={size}
      height={size}
      fill="none"
      className="group cursor-pointer"
      onClick={onClick}
    >
      <path
        className={`${strokeTailwind} transition-colors duration-[250ms]`}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M6.75 9h4.5M11.25 4.5H12a4.5 4.5 0 1 1 0 9h-.75M6.75 13.5H6a4.5 4.5 0 1 1 0-9h.75"
      />
    </svg>
  );
};

export default ShareLinkIcon;
