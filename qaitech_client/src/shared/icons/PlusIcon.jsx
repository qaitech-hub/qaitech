const PlusIcon = ({ style = "stroke-[#111]" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={18}
    height={18}
    fill="none"
    className="group min-w-[18px] min-h-[18px]"
  >
    <path
      className={`${style}`}
      strokeLinecap="round"
      strokeWidth={1.5}
      d="M15 9H3M9 15V3"
    />
  </svg>
);
export default PlusIcon;
