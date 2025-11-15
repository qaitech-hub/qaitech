import React, { useContext, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { NavLink, useLocation, useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";

import ArrowIcon from "../../shared/icons/ArrowIcon";

const Accordion = ({ item = {} }) => {
  const { pathname } = useLocation();
  const { workSpaceId } = useParams();

  const [openTop, setOpenTop] = useState(false);
  const [open, setOpen] = useState([]);

  useEffect(() => {
    item?.pages?.map((i) => {
      !!i?.reports?.find((j) => j.id === pathname?.split("/")[4]) &&
        setOpenTop(true);

      !!i?.reports?.find((j) => j.id === pathname?.split("/")[4]) &&
        setOpen([...open?.filter((k) => k !== i?.id), i.id]);
    });
  }, [item]);

  return (
    <div className={`flex flex-col w-full`}>
      <div
        className="flex flex-row items-center cursor-pointer px-[12px] py-[12px] gap-[12px] w-full"
        onClick={() => setOpenTop(!openTop)}
      >
        <ArrowIcon active={openTop} />
        <p className="text-[13px] text-accent-purple select-none truncate leading-[22px] tracking-[-1%]">
          {dayjs(item?.createdAt).format("dddd, D MMMM YYYY")}
        </p>
      </div>

      <AnimatePresence initial={false}>
        {openTop && (
          <motion.div
            className="flex flex-col gap-[6px] w-full"
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={{
              open: { opacity: 1, height: "auto", y: 0 },
              collapsed: { opacity: 0, height: 0, y: -25 },
            }}
            transition={{ duration: 0.2 }}
          >
            {item?.pages?.map((i, key) => (
              <React.Fragment key={key}>
                <div
                  className={`ml-[24px] flex flex-row px-[12px] py-[13px] transition-colors duration-[250ms] gap-[12px] cursor-pointer items-center bg-transparent`}
                  onClick={() => {
                    if (!open?.includes(i?.id)) setOpen([...open, i?.id]);
                    else setOpen(open.filter((k) => k !== i?.id));
                  }}
                >
                  <ArrowIcon active={open?.includes(i?.id)} />

                  <p
                    className={`text-[8px] font-bold select-none leading-[22px] tracking-[-2%] ${
                      i?.viewport?.title === "MOBILE"
                        ? "text-[#FF7E47]"
                        : i?.viewport?.title === "DESKTOP"
                        ? "text-[#3ECF8E]"
                        : "text-[#6C7AFF]"
                    }`}
                  >
                    {i?.viewport?.title}
                  </p>

                  <span
                    className={`text-[13px] select-none truncate leading-[22px] tracking-[-1%] ${
                      i?.deleted
                        ? "line-through text-accent-dark_purple"
                        : "text-accent-purple"
                    }`}
                  >
                    {i?.title}
                  </span>
                </div>

                <AnimatePresence initial={false}>
                  {open?.includes(i?.id) && (
                    <motion.div
                      className="flex flex-col gap-[6px] w-full"
                      initial="collapsed"
                      animate="open"
                      exit="collapsed"
                      variants={{
                        open: { opacity: 1, height: "auto", y: 0 },
                        collapsed: { opacity: 0, height: 0, y: -25 },
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      {i?.reports
                        // ?.sort(
                        //   (a, b) =>
                        //     new Date(b?.createdAt).getTime() -
                        //     new Date(a.createdAt).getTime()
                        // )
                        ?.map((j, key) => (
                          <NavLink
                            key={key}
                            to={`/workspace/${workSpaceId}/history/${j.id}`}
                            className={`ml-[48px] px-[12px] text-[12px] select-none truncate leading-[20px] tracking-[-0.8%] ${
                              pathname?.split("/")[4] === j?.id
                                ? "text-primary"
                                : "text-accent-purple"
                            }`}
                          >
                            {j?.test?.title}
                          </NavLink>
                        ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </React.Fragment>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Accordion;
