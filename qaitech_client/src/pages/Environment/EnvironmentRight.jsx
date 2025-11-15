import { useParams } from "react-router-dom";
import { useContext, useEffect, useState, useTransition } from "react";
import toast from "react-hot-toast";
import { MacScrollbar } from "mac-scrollbar";
import "mac-scrollbar/dist/mac-scrollbar.css";

import { Button } from "../../shared/ui/Button";
import { ModalContext } from "../../components/Modals/ModalHandlerWrap";
import { PagesContext } from "../../layouts/PagesContex";

import LogoHeaderIcon from "../../shared/icons/logo/LogoHeaderIcon";

import { getWbElementsForEnv } from "../../server/webelements/getWbElementsForEnv";
import CustomLoader from "../../shared/ui/CustomLoader";
import EnvironmentTable from "../../components/Environment/EnvironmentTable";
import { createEnvElements } from "../../server/webelements/createEnvElements";
import WorkSpaceNoPage from "../WorkSpaces/WorkSpaceNoPage";

const EnvironmentRight = () => {
  const { workSpaceId } = useParams();

  const { setCreatePageModal, setImportModal } = useContext(ModalContext);
  const { selectedPage, data } = useContext(PagesContext);

  const [elements, setElements] = useState(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      await (async () => {
        if (isPending) return;

        const res = await getWbElementsForEnv(selectedPage?.id);

        console?.log(res);

        if (res?.error) {
          toast.error(res?.error);
          return;
        }

        setElements(res);
      })();
    }, []);
  }, [selectedPage]);

  const handleCreateEnvElements = async () => {
    startTransition(async () => {
      await (async () => {
        if (isPending) return;

        try {
          const res = await createEnvElements(selectedPage?.id, elements);

          if (res?.error) {
            toast.error(res?.error);
            return;
          }

          toast.success(res?.success);
        } catch (err) {
          toast.error("Что-то пошло не так");

          return;
        }
      })();
    }, []);
  };

  if (data?.length === 0)
    return (
      <div className="flex flex-col gap-[36px] items-center justify-center w-full h-full">
        <Button
          text="Open Pages Overview"
          onClick={() => setCreatePageModal(true)}
          bgTailwind="bg-primary hover:bg-primary-hover   transition-colors duration-[250ms]"
          roundedTailwind="rounded-[12px]"
          paddingTailwind="px-[62px] py-[14px]"
          textTailwind="text-[#fff]"
        />
      </div>
    );

  if (!selectedPage || selectedPage?.projectId !== workSpaceId)
    return <WorkSpaceNoPage />;

  return (
    <div className="h-full grid grid-rows-[48px_calc(100%-72px)]">
      {/* header */}
      <div className="px-[12px] py-[8px] flex flex-row gap-[6px] w-full justify-end">
        <Button
          text="Import"
          onClick={() => setImportModal(true)}
          moreStyles="min-w-[50.5px] w-[50.5px] flex items-center justify-center"
          textTailwind="text-[13px] leading-[22px] tracking-[-1%] text-white font-medium"
          paddingTailwind="px-[10px] py-[4px]"
        />
        <Button
          disabled={isPending}
          loading={isPending}
          text="Save"
          onClick={handleCreateEnvElements}
          moreStyles="min-w-[50.5px] w-[50.5px] flex items-center justify-center"
          textTailwind="text-[13px] leading-[22px] tracking-[-1%] text-white font-medium"
          paddingTailwind="px-[10px] py-[4px]"
        />
      </div>
      {/* header */}

      <MacScrollbar
        skin="light"
        className="mt-[24px] pb-[24px] px-[12px] overflow-y-auto h-full w-full"
        trackStyle={() => ({
          backgroundColor: "transparent",
          margin: 3,
          border: "none",
        })}
        thumbStyle={() => ({
          backgroundColor: "#515677",
        })}
      >
        {!elements ? (
          <div className="w-full flex justify-center mt-[12px]">
            <CustomLoader
              size={22}
              color="rgba(153, 222, 175, 1)"
              secondaryColor="rgba(153, 222, 175, 0.6)"
            />
          </div>
        ) : (
          <>
            <EnvironmentTable
              steps={elements}
              setSteps={setElements}
              keys={["", "Title", "Selector"]}
            />
          </>
        )}
      </MacScrollbar>
    </div>
  );
};

export default EnvironmentRight;
