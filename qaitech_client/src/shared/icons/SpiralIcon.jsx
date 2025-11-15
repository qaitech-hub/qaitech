const SpiralIcon = ({ style = "stroke-primary" }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={18}
      height={18}
      fill="none"
      className="group min-w-[18px] min-h-[18px]"
    >
      <path
        className={`${style}`}
        strokeWidth={1.6}
        d="M5.668 9.604c-1.244-2.412 3.156-5.734 6.1-.86 3.947 6.532-5.95 10.145-9.261 4.812C-.804 8.224 1.311.831 9.154 1.003c7.842.172 10.631 13.073 4.531 15.997"
      />
    </svg>
  );
};

export default SpiralIcon;
