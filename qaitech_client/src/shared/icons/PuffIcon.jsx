const PuffIcon = ({ stroke = "stroke-primary" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={16}
    height={16}
    fill="none"
    className="min-w-[16px] min-h-[16px]"
  >
    <g
      className={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.4}
      clipPath="url(#apuff)"
    >
      <path d="M2 5.333h4.667a2 2 0 1 0-2-2M2.667 10.667H10a2 2 0 1 1-2 2M1.333 8h11.334a2 2 0 1 0-2-2" />
    </g>
    <defs>
      <clipPath id="apuff">
        <path fill="#fff" d="M0 0h16v16H0z" />
      </clipPath>
    </defs>
  </svg>
);
export default PuffIcon;
