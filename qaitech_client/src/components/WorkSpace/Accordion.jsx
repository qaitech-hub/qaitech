import { useContext, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { NavLink, useLocation, useNavigate, useParams } from "react-router-dom";

import ArrowIcon from "../../shared/icons/ArrowIcon";
import toast from "react-hot-toast";
import axios from "axios";

import { PagesContext } from "../../layouts/PagesContex";
import storage from "../../storage/localStorage";
import DotsIcon from "../../shared/icons/DotsIcon";
import DropDownWithIcon from "../../shared/ui/DropDownWithIcon";
import RenameIcons from "../../shared/icons/RenameIcons";
import { TrashIconRed } from "../../shared/icons/TrashIconRed";
import { ModalContext } from "../Modals/ModalHandlerWrap";
import { deletePage } from "../../server/page/deletePage";
import { renamePage } from "../../server/page/renamePage";
import ExportIcon from "../../shared/icons/ExportIcon";
import ImportIcon from "../../shared/icons/ImportIcon";

const Accordion = ({
  item = {},
  data = [],
  setData = (data) => {},
  getData = () => {},
}) => {
  const { pathname } = useLocation();
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { workSpaceId } = useParams();
  const { selectedPage, setSelectedPage } = useContext(PagesContext);
  const { handleConfirmation } = useContext(ModalContext);
  const [deleted, setDeleted] = useState(false);
  const [open, setOpen] = useState(false);
  const [modal, setModal] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [title, setTitle] = useState(item?.title);

  useEffect(() => {
    if (item.id === JSON.parse(storage.get("selectedPage"))?.id) setOpen(true);
  }, [storage]);

  useEffect(() => {
    if (
      pathname?.includes("/test/") &&
      JSON.parse(storage.get("selectedPage"))?.id === item?.id
    )
      setOpen(true);
  }, [storage]);

  useEffect(() => {
    if (modal === false) setIsHovered(false);
  }, [modal]);

  const handleExport = async (pageId, title) => {
    console.log(pageId);
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_SERVER_URL}/api/test-export-import/export/${pageId}`,
        { withCredentials: true }
      );
      const data = res.data;
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `page-tests-${title || pageId}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Export complete");
    } catch (e) {
      toast.error("Export error");
    }
  };

  const handleImport = async (pageId, projectId) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,application/json";
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const text = await file.text();
        const json = JSON.parse(text);
        const res = await axios.post(
          `${process.env.REACT_APP_SERVER_URL}/api/test-export-import/import/${projectId}/${pageId}`,
          json,
          { withCredentials: true }
        );
        if (res.data.success) {
          toast.success("Import success");
          getData();
        } else {
          toast.error(res.data.error || "Import error");
        }
      } catch (e) {
        toast.error("Import error");
      }
    };
    input.click();
  };

  const confirmationCallback = async (answer) => {
    if (answer === "no") return;

    const res = await deletePage(item.id);
    if (res?.error) {
      toast.error(res?.error);
      return;
    }

    if (JSON.parse(storage.get("selectedPage"))?.id === item.id) {
      storage.remove("selectedPage");
      navigate(`/workspace/${workSpaceId}`);
    }

    setDeleted(true);

    setTimeout(() => {
      setData(data.filter((i) => i.id !== item.id));
    }, [500]);
  };

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
    setIsHovered(false);
  };

  return (
    <AnimatePresence>
      {!deleted && (
        <motion.div
          className={`flex flex-col w-full`}
          initial={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1 }}
          transition={{ duration: 0.25, ease: "easeIn" }}
        >
          <div
            className={`flex flex-row px-[12px] py-[13px] relative transition-colors duration-[250ms] gap-[12px] cursor-pointer items-center ${
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
                setOpen(!open);
                setSelectedPage(item);
                navigate(`/workspace/${workSpaceId}`);
              }}
            />
            {item?.Test?.length > 0 && <ArrowIcon active={open} />}

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
                  id: "3",
                  name: "Import to JSON",
                  icon: <ImportIcon />,
                  textColor: "text-accent-purple",
                },
                {
                  id: "2",
                  name: "Export to JSON",
                  icon: <ExportIcon />,
                  textColor: "text-accent-purple",
                },
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
                switch (val.id) {
                  case "0":
                    setIsEdit(true);
                    break;
                  case "1":
                    handleConfirmation(confirmationCallback);
                    break;
                  case "2":
                    handleExport(selectedPage.id, title);
                    break;
                  case "3":
                    handleImport(selectedPage.id, title);
                    break;
                }
              }}
            />
          </div>

          <AnimatePresence initial={false}>
            {open && item?.Test?.length > 0 && (
              <motion.div
                className="flex flex-col gap-[6px] my-[6px] w-full"
                initial="collapsed"
                animate="open"
                exit="collapsed"
                variants={{
                  open: { opacity: 1, height: "auto", y: 0 },
                  collapsed: { opacity: 0, height: 0, y: -25 },
                }}
                transition={{ duration: 0.2 }}
              >
                {item?.Test?.map((i, key) => (
                  <NavLink
                    key={key}
                    to={`/workspace/${workSpaceId}/test/${i?.id}`}
                    className={`ml-[24px] pr-[12px] text-[12px] select-none truncate leading-[20px] tracking-[-0.8%] ${
                      pathname?.split("/")[4] === i?.id?.toString()
                        ? "text-primary"
                        : "text-accent-purple"
                    }`}
                  >
                    {i?.title}
                  </NavLink>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Accordion;
