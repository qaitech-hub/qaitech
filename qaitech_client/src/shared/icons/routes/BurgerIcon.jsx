const BurgerIcon = ({ active = false }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} fill="none">
    <path
      className={`${
        active ? "stroke-primary" : "stroke-accent-purple"
      } transition-colors duration-[250ms]`}
      strokeLinecap="round"
      strokeWidth={1.5}
      d="M3.75 13.5h10.5M5.25 9h7.5M2.25 4.5h13.5"
    />
  </svg>
);
export default BurgerIcon;
