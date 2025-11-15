import { useContext, useEffect, useState, useTransition } from "react";
import { useParams } from "react-router-dom";
import { MacScrollbar } from "mac-scrollbar";
import "mac-scrollbar/dist/mac-scrollbar.css";

import WorkSpaceNoPage from "../WorkSpaces/WorkSpaceNoPage";
import DropDownBlue from "../../shared/ui/DropDownBlue";
import { Button } from "../../shared/ui/Button";
import { PagesContext } from "../../layouts/PagesContex";

import CheckBox from "../../shared/ui/CheckBox";
import { getPageTests } from "../../server/test/getPageTests";
import { ModalContext } from "../../components/Modals/ModalHandlerWrap";
import CustomLoader from "../../shared/ui/CustomLoader";
import { runTest } from "../../server/test/runTest";
import toast from "react-hot-toast";

const RunPageId = () => {
  const { workSpaceId } = useParams();

  const [browser, setBrowser] = useState("");

  const { setCreatePageModal } = useContext(ModalContext);
  const { selectedPage, data } = useContext(PagesContext);

  const [loading, setLoading] = useState(null);
  const [tests, setTests] = useState(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const res = await getPageTests(selectedPage?.id);
      console.log(res, "steps");
      setTests([...res.map((i) => ({ ...i, active: false }))]);
    }, []);
  }, [selectedPage]);

  // run test
  const handleRunTest = async () => {
    if (isPending || loading) return;

    if (!browser) {
      toast?.error("Select browser");
      return;
    }

    setLoading(true);

    try {
      const res = await runTest(
        tests.map((i) => i?.active === true && i.id),
        browser
      );

      console.log("resss", res);

      if (!res?.overallStatus) {
        toast?.error(res?.steps[0]?.value?.split(": ")[1]);
        setLoading(false);
        return;
      }

      toast.success("Успех");
    } catch (err) {
      toast.error("Что-то пошло не так");
      setLoading(false);
      return;
    }

    setLoading(false);
  };
  // run test

  if (
    !selectedPage ||
    selectedPage?.projectId !== workSpaceId ||
    selectedPage?.Test?.length === 0
  )
    return <WorkSpaceNoPage />;

  if (isPending)
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

  return (
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
      <div className="py-[2px] px-[5px] flex flex-row gap-[6px] justify-between">
        <DropDownBlue
          items={[{ name: "Chrome" }, { name: "Firefox" }, { name: "Safari" }]}
          keyLabel="name"
          value={browser || "type of web"}
          onChange={(val) => setBrowser(val.name)}
        />

        <div className="flex flex-row gap-[16px]">
          <button
            type="button"
            disabled={loading || isPending || !tests}
            className="text-accent-purple hover:text-accent-dark_purple transition-colors duration-[250ms] leading-[16px] text-[13px] font-medium tracking-[-1%]"
            onClick={() => {
              setTests(tests.map((i) => ({ ...i, active: false })));
            }}
          >
            Deselect All
          </button>

          <button
            type="button"
            disabled={loading || isPending || !tests}
            className="text-accent-purple hover:text-accent-dark_purple transition-colors duration-[250ms] leading-[16px] text-[13px] font-medium tracking-[-1%]"
            onClick={() => {
              setTests(tests.map((i) => ({ ...i, active: true })));
            }}
          >
            Select All
          </button>

          <Button
            disabled={loading || isPending || !tests}
            loading={loading || isPending || !tests}
            text="Run"
            onClick={handleRunTest}
            moreStyles="min-w-[155.38px] w-[155.38px] h-[32px] flex items-center justify-center"
            textTailwind="text-[13px] leading-[22px] tracking-[-1%] text-white font-medium"
            paddingTailwind="gap-[3px] px-[55px] py-[4px] mt-[5px] mr-[7px]"
            bgTailwind="bg-accent-purple hover:bg-accent-dark_purple active:bg-accent-dark_purple transition-colors duration-[250ms]"
          ></Button>
        </div>
      </div>

      <div className="flex flex-col mt-[3px]">
        {isPending || !tests ? (
          <div className="w-full flex justify-center mt-[12px]">
            <CustomLoader
              size={22}
              color="rgba(153, 222, 175, 1)"
              secondaryColor="rgba(153, 222, 175, 0.6)"
            />
          </div>
        ) : (
          tests?.map((i) => (
            <button
              type="button"
              key={i.id}
              className="px-[24px] py-[6px] gap-[6px] flex flex-row items-center cursor-pointer"
              disabled={loading || isPending || !tests}
              onClick={() => {
                setTests(
                  tests.map((j) =>
                    i?.id === j.id ? { ...j, active: !j?.active } : { ...j }
                  )
                );
              }}
            >
              <CheckBox active={i?.active} />

              <p className="text-accent-text text-[13px] leading-[22px] tracking-[-1%]">
                {i?.title}
              </p>
            </button>
          ))
        )}
      </div>
    </MacScrollbar>
  );
};

export default RunPageId;
