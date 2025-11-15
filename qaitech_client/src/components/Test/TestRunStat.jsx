import { useEffect, useState, useTransition } from "react";

import CustomLoader from "../../shared/ui/CustomLoader";

import { getReportsSteps } from "../../server/test/getReportsSteps";
import StepsTable from "./StepsTable";
import { useLocation } from "react-router-dom";

const TestRunStat = ({ reportId = null, loading = false }) => {
  const { pathname } = useLocation();

  const [data, setData] = useState(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!!reportId)
      startTransition(async () => {
        await (async () => {
          const res = await getReportsSteps(reportId);
          console.log(res, "ass");
          setData(res);
        })();
      });
  }, [reportId]);

  useEffect(() => {
    setData(null);
  }, [pathname]);

  if (loading || isPending)
    return (
      <div className="w-full h-full flex items-center justify-center">
        <CustomLoader
          size={22}
          color="rgba(153, 222, 175, 1)"
          secondaryColor="rgba(153, 222, 175, 0.6)"
        />
      </div>
    );

  if (!data && !loading && !isPending)
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-accent-dark_purple select-none font-medium text-[12px] leading-[20px] tracking-[-1%] text-center">
          Press Run to start a test
        </p>
      </div>
    );

  return (
    <>
      {data?.length > 0 ? (
        <div className="p-[12px]">
          <StepsTable steps={data} />
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <p className="text-accent-dark_purple select-none font-medium text-[12px] leading-[20px] tracking-[-1%] text-center">
            Error
          </p>
        </div>
      )}
    </>
  );
};

export default TestRunStat;
