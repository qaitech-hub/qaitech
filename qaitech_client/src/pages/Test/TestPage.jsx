import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { MacScrollbar } from "mac-scrollbar";
import "mac-scrollbar/dist/mac-scrollbar.css";
import toast from "react-hot-toast";

import storage from "../../storage/localStorage";

import { getTest } from "../../server/test/getTest";

import SpiralIcon from "../../shared/icons/SpiralIcon";
import CreateTestTable from "../../components/CreateTest/CreateTestTable";
import CustomLoader from "../../shared/ui/CustomLoader";
import { getWbElements } from "../../server/webelements/getWbElements";
import { getWebelementsActions } from "../../server/webelementsActions/getWebelementsActions";
import { Input } from "../../shared/ui/Input";
import { Button } from "../../shared/ui/Button";
import { runTest } from "../../server/test/runTest";
import { updateTest } from "../../server/test/updateTest";
import { PagesContext } from "../../layouts/PagesContex";
import TestRunStat from "../../components/Test/TestRunStat";
import DropDownBlue from "../../shared/ui/DropDownBlue";
import { TrashIconRed } from "../../shared/icons/TrashIconRed";
import { ModalContext } from "../../components/Modals/ModalHandlerWrap";
import { deleteTest } from "../../server/test/deleteTest";

const TestPage = ({ defaultLayout = [80, 20] }) => {
  const { testId, workSpaceId } = useParams();
  const { handleConfirmation } = useContext(ModalContext);

  const [browser, setBrowser] = useState("Chrome");

  const navigate = useNavigate();

  const onLayout = (sizes) => {
    storage.set("layout2", JSON.stringify(sizes));
    setTopSize(sizes[0]);
  };

  const { selectedPage, updateData, setUpdateData } = useContext(PagesContext);

  const [topSize, setTopSize] = useState(
    storage.get("layout2")
      ? JSON.parse(storage.get("layout2"))[0]
      : defaultLayout[0]
  );

  useEffect(() => {
    if (!testId) navigate(`/workspace/${workSpaceId}`);
  }, [testId]);

  // get data
  const [data, setData] = useState(null);
  const [steps, setSteps] = useState(null);
  const [name, setName] = useState("");
  const [actions, setActions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [loading3, setLoading3] = useState(false);
  const [res, setRes] = useState(null);

  const getData = async () => {
    if (loading || loading2 || loading3) return;

    setLoading(true);

    const res = await getWbElements(selectedPage?.id);
    const res2 = await getWebelementsActions();
    const res3 = await getTest(testId);

    if (res?.error || res2?.error || res3?.error) {
      setLoading(false);

      toast.error(res?.error);
      return;
    }

    setData(res);
    setActions(res2);
    setSteps(res3?.test);
    setName(res3?.name);

    setLoading(false);
  };

  useEffect(() => {
    getData();
  }, [testId, workSpaceId]);
  // get data

  const handleUpdateTest = async () => {
    if (loading || loading2 || loading3) return { wait: true };

    if (!browser) {
      setLoading2(false);
      setLoading3(false);
      toast?.error("Select browser");
      return;
    }

    if (!name) {
      setLoading3(false);
      setLoading2(false);
      toast?.error("Enter test name");
      return;
    }

    setLoading3(true);

    try {
      const res = await updateTest(name, steps, testId);
      if (res?.error) {
        toast?.error(res?.error);
        setLoading3(false);
        return { error: "Не удалось обновить тест" };
      }

      setName(res?.name);
      setSteps(res?.test);
    } catch (err) {
      toast.error("Что-то пошло не так");
      setLoading3(false);
      return { error: "Не удалось обновить тест" };
    }

    setLoading3(false);
    setUpdateData(!updateData);

    return { success: "Ура" };
  };

  // run test
  const handleRunTest = async () => {
    if (loading || loading2 || loading3) return;

    setLoading2(true);

    try {
      const updRes = await handleUpdateTest();

      if (updRes?.error) {
        toast?.error(res?.error);
        setLoading3(false);
        return { error: "Не удалось обновить тест" };
      }

      const res = await runTest([testId], browser);

      console.log("resss", res);
      setRes(res?.reportId);

      if (!res?.overallStatus) {
        toast?.error(res?.steps[0]?.value?.split(": ")[1]);
        setLoading2(false);
        return;
      }

      toast.success("Успех");
    } catch (err) {
      toast.error("Что-то пошло не так");
      setLoading2(false);
      return;
    }

    setLoading2(false);
  };
  // run test

  const confirmationCallback = async (answer) => {
    if (answer === "no") return;

    const res = await deleteTest(testId);
    if (res?.error) {
      toast.error(res?.error);
      return;
    }

    navigate(`/workspace/${workSpaceId}`);
    setUpdateData(!updateData);
  };

  return (
    <PanelGroup direction="vertical" onLayout={onLayout}>
      {/* top */}
      <Panel
        defaultSize={
          storage.get("layout2")
            ? JSON.parse(storage.get("layout2"))[0]
            : defaultLayout[0]
        }
        className="h-full grid grid-rows-[48px_calc(100%-72px)]"
      >
        {/* header */}
        <div className="px-[12px] py-[8px] flex flex-row gap-[6px] w-full">
          <Input
            roundedTailwind="rounded-[8px]"
            placeholder="New Test"
            errorTailwind="hidden"
            labelTailwind="hidden"
            paddingTailwind="px-[12px] py-[8px]"
            textTailwind="text-[13px] leading-[20px] tracking-[-2%] text-accent-purple"
            placeholderTailwind="placeholder:text-accent-dark_purple"
            widthTailwind="w-[334px]"
            disabled={loading || loading2 || loading3}
            value={name}
            onChange={setName}
          />

          <DropDownBlue
            items={[
              { name: "Chrome" },
              { name: "Firefox" },
              { name: "Safari" },
            ]}
            keyLabel="name"
            value={browser || "type of web"}
            onChange={(val) => setBrowser(val.name)}
          />

          <div className="flex flex-row ml-auto gap-[8px]">
            <button
              type="button"
              className="px-[8px] hover:opacity-[70%] transition-opacity duration-[250ms]"
              onClick={() => handleConfirmation(confirmationCallback)}
            >
              <TrashIconRed />
            </button>
            <Button
              disabled={loading || loading2 || loading3}
              loading={loading || loading2 || loading3}
              text="Save"
              onClick={handleUpdateTest}
              moreStyles="min-w-[50.5px] w-[50.5px] flex items-center justify-center"
              textTailwind="text-[13px] leading-[22px] tracking-[-1%] text-white font-medium"
              paddingTailwind="px-[10px] py-[4px]"
            />
            <Button
              disabled={loading || loading2 || loading3}
              loading={loading || loading2 || loading3}
              text="Run"
              onClick={handleRunTest}
              moreStyles="min-w-[155.38px] w-[155.38px] flex items-center justify-center"
              textTailwind="text-[13px] leading-[22px] tracking-[-1%] text-white font-medium"
              paddingTailwind="gap-[3px] px-[55px] py-[4px]"
              bgTailwind="bg-accent-purple hover:bg-accent-dark_purple active:bg-accent-dark_purple transition-colors duration-[250ms]"
            ></Button>
          </div>
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
          {!data ? (
            <div className="w-full flex justify-center mt-[12px]">
              <CustomLoader
                size={22}
                color="rgba(153, 222, 175, 1)"
                secondaryColor="rgba(153, 222, 175, 0.6)"
              />
            </div>
          ) : (
            <>
              <CreateTestTable
                data={[
                  ...data.filter((i) => !!i?.fromEnv),
                  ...data?.filter((i) => !i.fromEnv),
                ]}
                steps={steps}
                actions={actions}
                setSteps={setSteps}
                keys={["", "Selector", "Actions", "Value"]}
              />
            </>
          )}
        </MacScrollbar>
      </Panel>
      {/* top */}

      <PanelResizeHandle className="w-full h-[1px] border-primary border-t-[1px] cursor-h-resize" />

      {/* bottom */}
      <Panel
        minSize={11}
        maxSize={91.5}
        defaultSize={
          storage.get("layout2")
            ? JSON.parse(storage.get("layout2"))[1]
            : defaultLayout[1]
        }
      >
        <MacScrollbar
          skin="light"
          className="verflow-y-auto h-full w-full"
          trackStyle={() => ({
            backgroundColor: "transparent",
            margin: 3,
            border: "none",
          })}
          thumbStyle={() => ({
            backgroundColor: "#515677",
          })}
        >
          <TestRunStat
            reportId={res}
            loading={loading || loading2 || loading3}
          />
        </MacScrollbar>
      </Panel>
      {/* bottom */}
    </PanelGroup>
  );
};

export default TestPage;
