import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { useClipboard } from "use-clipboard-copy";

import { TgIcon } from "../../shared/icons/socials/TgIcon";
import { LandLogo } from "../../shared/icons/logo/LandLogo";
import { WatsappIcon } from "../../shared/icons/socials/WatsappIcon";

const HeaderSecond = () => {
  const clipboard = useClipboard();

  return (
    <div className={`fixed top-0 w-full z-[49] left-0 bg-primary`}>
      <div className="h-[78px] max-w-[1460px] w-full mx-auto relative items-center justify-center py-[20px] flex flex-row gap-[16px]">
        {/* logo */}
        <LandLogo style="absolute left-[20px]" />
        {/* logo */}

        {/* socials */}
        <WatsappIcon />
        <TgIcon />
        {/* socials */}

        {/* mail */}
        <button
          onClick={() => {
            clipboard.copy("info@QAITECH.tech");
            toast.success("Почта скопирована!");
          }}
          className="absolute right-[379.81px] text-[#fff] hover:text-[rgba(255,255,255,.8)] transition-colors duration-[200ms] text-[18px] leading-[29px] tracking-[-2%] font-medium underline"
        >
          info@QAITECH.tech
        </button>
        {/* mail */}

        {/* conful butt */}
        <button className="bg-[#000] absolute right-[20px] mx-auto w-fit px-[30px] py-[12px] rounded-[14px] flex flex-row gap-[5px] items-center justify-center">
          <p className="text-[#fff] text-[18px] font-semibold leading-[28px] tracking-[-0.5%] ">
            Записаться на консультацию
          </p>

          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={18}
            height={18}
            fill="none"
          >
            <path
              stroke="#9E9E9E"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.8}
              d="M15.75 9H5.4M11.25 4.5l4.5 4.5-4.5 4.5"
            />
          </svg>
        </button>
        {/* conful butt */}
      </div>
    </div>
  );
};

export default HeaderSecond;
