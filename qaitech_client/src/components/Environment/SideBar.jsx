import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { MacScrollbar } from "mac-scrollbar";
import "mac-scrollbar/dist/mac-scrollbar.css";
import toast from "react-hot-toast";

import Accordion from "../WorkSpace/Accordion";
import CustomLoader from "../../shared/ui/CustomLoader";

import { Button } from "../../shared/ui/Button";
import { Input } from "../../shared/ui/Input";

import { ModalContext } from "../Modals/ModalHandlerWrap";
import { PagesContext } from "../../layouts/PagesContex";

import { getPagesForWorkspace } from "../../server/page/getPagesForWorkspace";
import PageCard from "./PageCard";

const SideBar = () => {
  const { workSpaceId } = useParams();

  const { createPageModal, setCreatePageModal } = useContext(ModalContext);
  const { data, setData, test } = useContext(PagesContext);

  const [input, setInput] = useState("");

  const [loading, setLoading] = useState(false);

  const getData = async () => {
    // console.log("fetching");
    if (loading) return;
    setLoading(true);
    const res = await getPagesForWorkspace(workSpaceId, input);
    console.log("client rr", res);

    if (!!res?.error) {
      toast.error(res?.error);
      return;
    }

    setData(res);
    setLoading(false);
  };

  useEffect(() => {
    getData("");
  }, [getPagesForWorkspace, input, createPageModal, workSpaceId, test]);

  return (
    <>
      {/* search */}
      <div className="h-full border-b-[0px] border-b-primary px-[12px] py-[8px] overflow-hidden flex flex-row gap-[12px] items-center">
        <div className="flex flex-row overflow-visible gap-[8px] items-center w-full">
          {/* <PlusIcon /> */}

          <Input
            placeholder="Search"
            value={input}
            onChange={setInput}
            style="min-w-[61px] w-full"
            errorTailwind="hidden"
          />
        </div>

        <Button text="import" onClick={() => setCreatePageModal(true)} />
      </div>
      {/* search */}

      {/* accordions */}
      <MacScrollbar
        skin="light"
        className="overflow-y-auto w-full h-full flex flex-col"
        trackStyle={() => ({
          backgroundColor: "transparent",
          margin: 3,
          border: "none",
        })}
        thumbStyle={() => ({
          backgroundColor: "#515677",
        })}
      >
        {/* {data?.map((i, key) => (
          
        ))} */}
        {!data ? (
          <div className="w-full flex justify-center mt-[12px]">
            <CustomLoader
              size={22}
              color="rgba(153, 222, 175, 1)"
              secondaryColor="rgba(153, 222, 175, 0.6)"
            />
          </div>
        ) : data?.length === 0 ? (
          <div className="flex flex-col w-full px-[12px] gap-[5px] mt-[12px]">
            {input?.length > 0 ? (
              <p className="text-center select-none text-[13px] leading-[16px] whitespace-pre-wrap tracking-[-1%] text-accent-dark_purple">
                Ничего не найдено
              </p>
            ) : (
              <>
                <p className="text-center select-none text-[13px] font-medium leading-[22px] tracking-[-1%] text-accent-purple">
                  Import a page
                </p>
                <p className="text-center select-none text-[13px] leading-[16px] px-[12px] whitespace-pre-wrap tracking-[-1%] text-accent-dark_purple">
                  Импортируйте страницу вашего веб приложения
                </p>
              </>
            )}
          </div>
        ) : (
          <>
            {data?.map((item) => (
              <PageCard
                key={item?.id}
                item={item}
                data={data}
                setData={setData}
              />
            ))}
          </>
        )}
      </MacScrollbar>
      {/* accordions */}
    </>
  );
};

export default SideBar;
