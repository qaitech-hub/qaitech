import { Link, useLocation } from "react-router-dom";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import DotsIcon from "../icons/DotsIcon";
import ShareLinkIcon from "../icons/ShareLinkIcon";

dayjs.extend(relativeTime);
require("dayjs/locale/en");
dayjs.locale("en");
var updateLocale = require("dayjs/plugin/updateLocale");
dayjs.extend(updateLocale);

const WorkSpaceCard = ({ item = {}, onClick = () => {} }) => {
  const { pathname } = useLocation();

  return (
    <div className="w-full flex flex-row gap-[12px] items-center border-b-[1px] border-accent-text pr-[12px]">
      <Link
        to={`/workspace/${item?.id}`}
        className="flex flex-row justify-between w-full pt-[6px] pb-[5px] pl-[6px]"
        onClick={onClick}
      >
        <p
          className={`text-[13px] truncate leading-[22px] tracking-[-1%] ${
            pathname.split("/")[2] !== item?.id
              ? "text-accent-purple"
              : "text-accent-text"
          }`}
        >
          {item?.title}
        </p>

        <p className="text-[13px] truncate text-accent-dark_purple leading-[22px] tracking-[-1%]">
          {dayjs().to(item.createdAt)}
        </p>
      </Link>

      {/* <ShareLinkIcon onClick={() => console.log("click")} />
      <DotsIcon /> */}
    </div>
  );
};

export default WorkSpaceCard;
