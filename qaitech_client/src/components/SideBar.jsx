import { useContext } from "react";
import { NavLink, useLocation, useParams } from "react-router-dom";

import { ModalContext } from "../components/Modals/ModalHandlerWrap";

import BurgerIcon from "../shared/icons/routes/BurgerIcon";
import SquareIcon from "../shared/icons/routes/SquareIcon";
import RunIcon from "../shared/icons/routes/RunIcon";
import ClockIcon from "../shared/icons/routes/ClockIcon";
import AiIcon from "../shared/icons/routes/AiIcon";
import LogoutIcon from "../shared/icons/routes/LogoutIcon";

import { logout } from "../server/auth/logout";
import toast from "react-hot-toast";

const SideBar = () => {
  const { workSpaceId } = useParams();
  const { pathname } = useLocation();

  const { aiApiModal, setAiApiModal } = useContext(ModalContext);

  const handleLogout = async () => {
    const res = await logout();

    if (res.error) {
      toast.error("Something went wrong");
      return;
    }

    window.location.reload();
  };

  return (
    <div className="border-r-[1px] border-primary flex flex-col gap-[12px] w-[56px] p-[12px] h-full">
      <NavLink
        to={workSpaceId ? `/workspace/${workSpaceId.toString()}/` : "/error"}
      >
        <div
          className={`p-[7px] rounded-[8px] cursor-pointer ${
            // !pathname?.includes("environment") &&
            // !pathname?.includes("history") &&
            // !pathname?.includes("run")
            //   ? "bg-primary"
            //   : "bg-[#fff]"
            ""
          } transition-colors duration-[250ms]`}
        >
          <BurgerIcon
            active={
              !pathname?.includes("environment") &&
              !pathname?.includes("history") &&
              !pathname?.includes("run") &&
              !pathname?.includes("charts")
            }
          />
        </div>
      </NavLink>

      <NavLink
        to={
          workSpaceId
            ? `/workspace/${workSpaceId.toString()}/environment`
            : "/error"
        }
      >
        <div
          className={`p-[7px] rounded-[8px] cursor-pointer transition-colors duration-[250ms]`}
        >
          <SquareIcon active={pathname?.includes("environment")} />
        </div>
      </NavLink>

      <NavLink
        to={
          workSpaceId
            ? `/workspace/${workSpaceId.toString()}/history`
            : "/error"
        }
      >
        <div
          className={`p-[7px] rounded-[8px] cursor-pointer transition-colors duration-[250ms]`}
        >
          <ClockIcon active={pathname?.includes("history")} />
        </div>
      </NavLink>

      <NavLink
        to={workSpaceId ? `/workspace/${workSpaceId.toString()}/run` : "/error"}
      >
        <div
          className={`p-[7px] rounded-[8px] cursor-pointer transition-colors duration-[250ms]`}
        >
          <RunIcon active={pathname?.includes("run")} />
        </div>
      </NavLink>

      <div
        onClick={() => setAiApiModal(true)}
        className={`p-[7px] rounded-[8px] cursor-pointer transition-colors duration-[250ms]`}
      >
        <AiIcon active={aiApiModal} />
      </div>

      {/* <NavLink
        to={
          workSpaceId ? `/workspace/${workSpaceId.toString()}/charts` : "/error"
        }
      >
        <div
          className={`p-[7px] rounded-[8px] cursor-pointer transition-colors duration-[250ms]`}
        >
          <p
            className={`${
              pathname?.includes("charts") ? "text-primary" : "text-gray-4300"
            } w-[18px] h-[12px] font-normal leading-[18px] text-[18px] text-center`}
          >
            Ch
          </p>
        </div>
      </NavLink> */}

      {/* <div
        onClick={handleLogout}
        className={`p-[7px] rounded-[8px] group cursor-pointer mt-auto transition-colors duration-[250ms]`}
      >
        <LogoutIcon />
      </div> */}
    </div>
  );
};

export default SideBar;
