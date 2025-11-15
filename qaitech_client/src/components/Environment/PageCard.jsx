import { useLocation } from "react-router-dom";
import { useContext, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";

import storage from "../../storage/localStorage";
import { PagesContext } from "../../layouts/PagesContex";
import { deletePage } from "../../server/page/deletePage";
import DotsIcon from "../../shared/icons/DotsIcon";
import DropDownWithIcon from "../../shared/ui/DropDownWithIcon";
import RenameIcons from "../../shared/icons/RenameIcons";
import { TrashIconRed } from "../../shared/icons/TrashIconRed";
import { ModalContext } from "../Modals/ModalHandlerWrap";
import { renamePage } from "../../server/page/renamePage";

const PageCard = ({
  item = {},
  onClick = () => {},
  data = [],
  setData = (data) => {},
}) => {
  const inputRef = useRef(null);
  const { pathname } = useLocation();
  const { selectedPage, setSelectedPage } = useContext(PagesContext);
  const { handleConfirmation } = useContext(ModalContext);

  const [deleted, setDeleted] = useState(false);
  const [modal, setModal] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [title, setTitle] = useState(item?.title);

  const confirmationCallback = async (answer) => {
    if (answer === "no") return;

    const res = await deletePage(item.id);
    if (res?.error) {
      toast.error(res?.error);
      return;
    }

    if (JSON.parse(storage.get("selectedPage"))?.id === item.id) {
      storage.remove("selectedPage");
      setSelectedPage(null);
    }

    setDeleted(true);

    setTimeout(() => {
      setData(data.filter((i) => i.id !== item.id));
    }, [500]);
  };

  useEffect(() => {
    if (modal === false) setIsHovered(false);
  }, [modal]);

  useEffect(() => {
    if (inputRef?.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEdit]);

  const editName = async () => {
    const res = await renamePage(item.id, title);
    if (res?.error) {
      toast.error(res?.error);
      setTitle(item?.title);
    }

    setIsEdit(false);
  };

  return (
    <AnimatePresence>
      {!deleted && (
        <motion.div
          initial={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1 }}
          transition={{ duration: 0.25, ease: "easeIn" }}
          className={`flex flex-row px-[12px] relative py-[13px] transition duration-[250ms] gap-[12px] cursor-pointer items-center ${
            selectedPage?.id === item?.id
              ? "bg-[#060314] bg-opacity-[90%]"
              : "bg-transparent"
          }`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div
            className="absolute z-10 w-full h-full left-0"
            onClick={() => {
              onClick();
              setSelectedPage(item);
            }}
          />
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

          {!isEdit ? (
            <p
              className={`text-[13px] select-none truncate leading-[22px] tracking-[-1%] ${
                item?.tests?.find(
                  (i) => i?.id?.toString() === pathname?.split("/")[3]
                )
                  ? "text-primary"
                  : "text-accent-purple"
              }`}
            >
              {title}
            </p>
          ) : (
            <>
              <div
                className="fixed top-0 left-0 w-full h-full z-40 cursor-default"
                onClick={() => {
                  setIsEdit(false);
                  editName();
                }}
              />
              <input
                ref={inputRef}
                className={`text-[13px] bg-transparent z-50 select-none truncate leading-[22px] tracking-[-1%] ${
                  item?.tests?.find(
                    (i) => i?.id?.toString() === pathname?.split("/")[3]
                  )
                    ? "text-primary"
                    : "text-accent-purple"
                }`}
                onKeyDown={(e) => {
                  if (e.key === "Enter") editName();
                }}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </>
          )}

          <motion.div
            className="ml-auto group absolute right-0 px-[12px] py-[15px] z-20"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: isHovered || modal ? 1 : 0,
              scale: isHovered || modal ? 1 : 0.8,
            }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={() => setModal(true)}
          >
            <DotsIcon />
          </motion.div>
          <motion.div
            className="ml-auto relative pl-[12px] z-20"
            style={{ display: isHovered || modal ? "block" : "none" }}
          ></motion.div>

          <DropDownWithIcon
            openState={modal}
            setOpenState={setModal}
            items={[
              {
                id: "0",
                name: "Rename",
                icon: <RenameIcons />,
                textColor: "text-accent-purple",
              },
              {
                id: "1",
                name: "Delete",
                icon: <TrashIconRed />,
                textColor: "text-[#fc2929]",
              },
            ]}
            onChange={(val) => {
              if (val.id === "0") setIsEdit(true);
              if (val.id === "1") handleConfirmation(confirmationCallback);
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PageCard;
