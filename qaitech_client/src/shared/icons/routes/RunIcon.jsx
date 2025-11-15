const RunIcon = ({ active = false }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} fill="none">
    <path
      className={`${
        active ? "stroke-primary" : "stroke-accent-purple"
      } transition-colors duration-[250ms]`}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M13.5 5.625a1.875 1.875 0 1 0 0-3.75 1.875 1.875 0 0 0 0 3.75ZM4.5 6.289l3.002-1.04 4.123 1.968-4.123 3.075 4.123 2.714L9.003 16.5M13.245 8.116l1.005.547L16.5 6.55M6.319 11.83l-1.114 1.466-3.704 2.077"
    />
  </svg>
);

export default RunIcon;
