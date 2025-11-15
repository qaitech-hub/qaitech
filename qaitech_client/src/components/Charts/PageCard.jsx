import { useContext } from "react";
import { useLocation } from "react-router-dom";

import { PagesContext } from "../../layouts/PagesContex";

const PageCard = ({ item = {}, onClick = () => {} }) => {
  const { pathname } = useLocation();
  const { selectedPage, setSelectedPage } = useContext(PagesContext);

  return (
    <div
      className={`flex flex-row px-[12px] py-[13px] transition-colors duration-[250ms] gap-[12px] cursor-pointer items-center ${
        selectedPage?.id === item?.id ? "bg-[#F2F2F2]" : "bg-transparent"
      }`}
      onClick={() => {
        onClick();
        setSelectedPage(item);
      }}
    >
      {item?.viewport && (
        <p
          className={`text-[8px] font-bold select-none leading-[22px] tracking-[-2%] ${
            item?.viewport?.title === "MOBILE"
              ? "text-[#FF7E47]"
              : item?.viewport?.title === "DESKTOP"
              ? "text-[#3ECF8E]"
              : "text-[#6C7AFF]"
          }`}
        >
          {item?.viewport?.title}
        </p>
      )}

      <p
        className={`text-[13px] select-none truncate leading-[22px] tracking-[-1%] ${
          item?.tests?.find(
            (i) => i?.id?.toString() === pathname?.split("/")[3]
          )
            ? "text-primary"
            : "text-[#111]"
        }`}
      >
        {item?.title}
      </p>
    </div>
  );
};

export default PageCard;
