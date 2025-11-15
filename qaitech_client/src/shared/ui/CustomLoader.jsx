import { Oval } from "react-loader-spinner";

const CustomLoader = ({
  size = 18,
  color = "rgba(255, 255, 255, 1)",
  secondaryColor = "rgba(255, 255, 255, 0.3)",
  width = 6,
}) => {
  return (
    <Oval
      height={size}
      width={size}
      color={color}
      wrapperStyle={{}}
      wrapperClass=""
      visible={true}
      ariaLabel="oval-loading"
      secondaryColor={secondaryColor}
      strokeWidth={width}
      strokeWidthSecondary={width}
    />
  );
};

export default CustomLoader;
