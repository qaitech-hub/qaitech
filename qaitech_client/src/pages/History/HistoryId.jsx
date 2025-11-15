import { useContext, useEffect, useState, useTransition } from "react";
import { useParams } from "react-router-dom";
import { MacScrollbar } from "mac-scrollbar";
import "mac-scrollbar/dist/mac-scrollbar.css";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import ArrowRightIcon from "../../shared/icons/ArrowRightIcon";
import { SuccessIcon, ErrorIcon } from "../../shared/icons/StatusIcon";
import { getReport } from "../../server/history/getReport";
import CustomLoader from "../../shared/ui/CustomLoader";
import { ModalContext } from "../../components/Modals/ModalHandlerWrap";

dayjs.extend(relativeTime);
require("dayjs/locale/en");
dayjs.locale("en");
var updateLocale = require("dayjs/plugin/updateLocale");
dayjs.extend(updateLocale);

const HistoryId = () => {
  const { reportId } = useParams();
  const { handleScreenshot } = useContext(ModalContext);

  const [isPending, startTransition] = useTransition();
  const [data, setData] = useState(null);

  const formatTime = (ms) => {
    const time = dayjs(ms); // Создаем объект dayjs из миллисекунд
    const seconds = time.second(); // Получаем секунды
    const milliseconds = time.millisecond(); // Получаем миллисекунды

    return `${seconds}s ${String(milliseconds).padStart(3, "0")}ms`;
  };

  const screenshots = data?.ReportStep?.map((i) => i?.Screenshot?.data);

  useEffect(() => {
    startTransition(async () => {
      await (async () => {
        const res = await getReport(reportId);
        console.log(res);
        setData(res);
      })();
    });
  }, [reportId]);

  if (isPending)
    return (
      <div className="flex h-full w-full justify-center items-center">
        <CustomLoader
          size={22}
          color="rgba(153, 222, 175, 1)"
          secondaryColor="rgba(153, 222, 175, 0.6)"
        />
      </div>
    );

  return (
    <MacScrollbar
      skin="light"
      className="overflow-y-auto w-full h-full px-[12px] py-[15px] flex flex-col"
      trackStyle={() => ({
        backgroundColor: "transparent",
        margin: 3,
        border: "none",
      })}
      thumbStyle={() => ({
        backgroundColor: "#515677",
      })}
    >
      <div className="flex flex-row justify-between gap-[6px]">
        <div className="flex flex-col">
          {/* name + status */}
          <div className="flex flex-row gap-[8px]">
            <p className="text-accent-purple text-[16px] font-medium leading-[19px] tracking-[-4%]">
              {data?.test?.title}
            </p>

            <p
              className={`${
                !!data?.status ? "text-[#3ECF8E]" : "text-[#E24444]"
              } text-[16px] font-medium leading-[19px] tracking-[-4%]`}
            >
              {!!data?.status ? "passed" : "failed"}
            </p>
          </div>
          {/* name + status */}

          {/* duration */}
          <p className="text-accent-dark_purple text-[14px] leading-[22px] tracking-[-1%]">
            Duration: {formatTime(data?.executionTime)}
          </p>
          {/* duration */}
        </div>

        {/* duration */}
        <p className="text-accent-dark_purple text-[14px] leading-[22px] tracking-[-1%]">
          {dayjs(data?.createdAt).format("DD.MM.YYYY - HH:mm:ss")}
        </p>
        {/* duration */}
      </div>

      {/* error  */}
      {/* <div className="whitespace-pre-wrap rounded-[8px] mt-[15px] mb-[24px] p-[12px] w-full bg-[#FFE1E1]">
        <p className="text-[#111] text-[14px] leading-[22px] tracking-[-1%]">{`element (#main) still not present on page after 2 sec waiting for selector:
timeout 2000ms esceeded`}</p>
      </div> */}
      {/* error  */}

      {/* test body */}
      <div className="p-[12px] items-center mt-[8px] flex flex-row gap-[12px]">
        {/* <ArrowRightIcon /> */}
        <p className="text-accent-dark_purple font-medium text-[14px] leading-[22px] tracking-[-1%]">
          Test body
        </p>
      </div>

      {data?.ReportStep?.map((i, key) => (
        <div
          key={i.id}
          className="flex flex-row gap-[12px] justify-between px-[12px] py-[6px] items-center"
        >
          <div className="flex flex-row gap-[6px] items-center overflow-hidden">
            {!!i.status ? <SuccessIcon /> : <ErrorIcon />}
            <p className="text-accent-dark_purple truncate font-normal text-[14px] leading-[22px] tracking-[-1%]">
              {i.value}
            </p>
          </div>

          {/* <div className="flex flex-row gap-[6px]"> */}
          <button
            type="button"
            className="text-primary min-w-[115px] font-normal text-[14px] leading-[22px] tracking-[-1%]"
            onClick={() =>
              handleScreenshot({
                arr: screenshots,
                width: i?.report?.test?.page?.viewport?.width,
                height: i?.report?.test?.page?.viewport?.height,
                viewport: i?.report?.test?.page?.viewport?.title,
                initIndex: key,
              })
            }
          >
            Open screenshot
          </button>
          {/* 
            <p className="text-primary font-normal text-[14px] leading-[22px] tracking-[-1%]">
              451.2 KB
            </p> */}
          {/* </div> */}
        </div>
      ))}
      {/* test body */}
    </MacScrollbar>
  );
};

export default HistoryId;
