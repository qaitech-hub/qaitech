const Card = ({
  children,
  roundedTailwind = "rounded-[8px]",
  paddingTailwind = "px-[12px] py-[8px]",
  widthTailwind = "w-fit",
  bgTailwind = "bg-[#080b1a] border-[1px]",
  moreStyles = "",
}) => {
  return (
    <div
      className={`${bgTailwind} ${roundedTailwind} ${paddingTailwind} ${widthTailwind} ${moreStyles} border-accent-text`}
    >
      {children}
    </div>
  );
};

export default Card;
