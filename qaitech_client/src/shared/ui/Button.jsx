import { NavLink } from "react-router-dom";

import CustomLoader from "../ui/CustomLoader";

export const Button = ({
  onClick = () => {},
  loading = false,
  disabled = false,
  text = "empty",
  type = "button",
  roundedTailwind = "rounded-[8px]",
  paddingTailwind = "py-[8px] px-[12px]",
  bgTailwind = "bg-primary hover:bg-primary-hover   transition-colors duration-[250ms]",
  textTailwind = "text-white text-[10px] leading-[16px] tracking-[-1.5%] font-medium",
  tailwindWidth = "w-fit",
  moreStyles = "",
  children,
  loaderSize = 16,
  loaderWidth = 6,
  loaderColor = "rgba(255, 255, 255, 1)",
  loaderSecondaryColor = "rgba(255, 255, 255, 1)",
}) => {
  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      type={type}
      className={`${roundedTailwind} ${paddingTailwind} ${bgTailwind} ${textTailwind} ${tailwindWidth} ${moreStyles} select-none flex flex-row items-center group transition-colors cursor-pointer duration-[250ms]`}
    >
      {loading ? (
        <CustomLoader
          size={loaderSize}
          width={loaderWidth}
          color={loaderColor}
          secondaryColor={loaderSecondaryColor}
        />
      ) : (
        <>
          {text}
          {children}
        </>
      )}
    </button>
  );
};

export const ButtonLink = ({
  to = "/",
  target = "_self",
  text = "empty",
  tailwindText = "text-[15px] leading-[20px] tracking-[-2%] text-primary hover:text-primary-hover transition-colors duration-[250ms]",
  moreStyles = "",
}) => {
  return (
    <NavLink
      to={to}
      target={target}
      className={`${tailwindText} ${moreStyles}`}
    >
      {text}
    </NavLink>
  );
};
