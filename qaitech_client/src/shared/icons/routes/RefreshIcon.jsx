const RefreshIcon = ({ active = false }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} fill="none">
      <path
        className={`${
          active ? "stroke-primary" : "stroke-accent-purple"
        } transition-colors duration-[250ms]`}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M3.2 12.045a6.693 6.693 0 0 0 2.936 2.983 6.53 6.53 0 0 0 4.103.624 6.597 6.597 0 0 0 3.665-1.98 6.8 6.8 0 0 0 1.791-3.809 6.852 6.852 0 0 0-.783-4.147 6.677 6.677 0 0 0-3.05-2.862 6.525 6.525 0 0 0-4.126-.456c-1.387.301-2.525.985-3.465 2.067-.367.4-.675.849-.915 1.335"
      />
      <path
        className={`${
          active ? "stroke-primary" : "stroke-accent-purple"
        } transition-colors duration-[250ms]`}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="m6.698 5.86-3.78.68-.668-3.848"
      />
    </svg>
  );
};

export default RefreshIcon;
