import { Link } from "react-router-dom";
import { useContext } from "react";

import { ModalContext } from "./Modals/ModalHandlerWrap";

import LogoHeaderIcon from "../shared/icons/logo/LogoHeaderIcon";

const Header = () => {
  const { setWorkSpaceModal } = useContext(ModalContext);

  return (
    <div className="h-full w-full flex flex-row gap-[16px] items-center border-b-[1px] border-primary py-[6px] px-[12px]">
      <Link to={"/home"}>
        <LogoHeaderIcon />
      </Link>

      <button
        className="text-[13px] font-medium leading-[16px] text-primary hover:text-primary-hover   transition-colors duration-[250ms] tracking-[-1.5%] select-none"
        onClick={() => setWorkSpaceModal(true)}
      >
        Workspaces
      </button>
    </div>
  );
};

export default Header;
