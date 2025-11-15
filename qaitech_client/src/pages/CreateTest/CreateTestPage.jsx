import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { MacScrollbar } from "mac-scrollbar";
import "mac-scrollbar/dist/mac-scrollbar.css";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";

import storage from "../../storage/localStorage";

import { Input } from "../../shared/ui/Input";
import { Button } from "../../shared/ui/Button";

import { getWbElements } from "../../server/webelements/getWbElements";
import { PagesContext } from "../../layouts/PagesContex";
import CustomLoader from "../../shared/ui/CustomLoader";
import CreateTestTable from "../../components/CreateTest/CreateTestTable";
import { getWebelementsActions } from "../../server/webelementsActions/getWebelementsActions";
import { createTest } from "../../server/test/createTest";
import { TrashIconRed } from "../../shared/icons/TrashIconRed";

const CreateTestPage = ({ defaultLayout = [80, 20] }) => {
  const { workSpaceId } = useParams();

  const { selectedPage, setTest } = useContext(PagesContext);

  const [steps, setSteps] = useState([
    { id: uuidv4(), element: { title: "" }, action: { name: "" }, value: "" },
  ]);

  console.log(steps);

  const navigate = useNavigate();

  const onLayout = (sizes) => {
    storage.set("layout2", JSON.stringify(sizes));
    setTopSize(sizes[0]);
  };

  const [topSize, setTopSize] = useState(
    storage.get("layout2")
      ? JSON.parse(storage.get("layout2"))[0]
      : defaultLayout[0]
  );

  const [data, setData] = useState(null);
  const [actions, setActions] = useState(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);

  const getData = async () => {
    // console.log("fetching");
    if (loading) return;
    setLoading(true);
    const res = await getWbElements(selectedPage?.id);
    const res2 = await getWebelementsActions();
    console.log("client web elements", res);

    if (!!res?.error || !!res2?.error) {
      toast.error(res?.error);
      return;
    }

    setData(res);
    setActions(res2);

    setLoading(false);
  };

  useEffect(() => {
    if (!selectedPage) navigate(`/workspace/${workSpaceId}`);
  }, [selectedPage]);

  useEffect(() => {
    getData();
  }, [getWbElements, getWebelementsActions, workSpaceId, selectedPage]);

  // create test
  const handleCreate = async () => {
    if (loading2) return;
    if (!name) {
      setLoading2(false);
      toast?.error("Enter test name");
      return;
    }
    setLoading2(true);
    try {
      const res = await createTest(name, selectedPage?.id, steps);

      if (!!res?.error) {
        toast.error(res?.error);
        setLoading2(false);
        return;
      }
      toast.success(res?.success);
      setTest(res?.test);
      navigate(`/workspace/${workSpaceId}/test/${res?.test?.id}`);
    } catch (err) {
      toast.error("Client error");
    }

    setLoading2(false);
  };
  // create test

  return (
    <>
      {/* header */}
      <div className="px-[12px] py-[8px] flex flex-row gap-[6px] w-full justify-between">
        <Input
          roundedTailwind="rounded-[8px]"
          placeholder="New Test"
          errorTailwind="hidden"
          labelTailwind="hidden"
          paddingTailwind="px-[12px] py-[8px]"
          textTailwind="text-[13px] leading-[20px] tracking-[-2%] text-accent-purple"
          placeholderTailwind="placeholder:text-accent-dark_purple"
          widthTailwind="w-[334px]"
          value={name}
          onChange={setName}
        />

        <div className="flex flex-row gap-[8px]">
          <Button
            loading={loading || loading2}
            disabled={loading || loading2}
            onClick={handleCreate}
            text="Save"
            moreStyles="min-w-[50.5px] w-[50.5px] flex items-center justify-center"
            textTailwind="text-[13px]  tracking-[-1%] text-white font-medium"
            paddingTailwind="px-[10px] py-[4px]"
          />
        </div>
      </div>
      {/* header */}

      <MacScrollbar
        skin="light"
        className="mt-[24px] pb-[99px] px-[12px] overflow-y-auto h-full w-full"
        trackStyle={() => ({
          backgroundColor: "transparent",
          margin: 3,
          border: "none",
        })}
        thumbStyle={() => ({
          backgroundColor: "#515677",
        })}
      >
        {loading ? (
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
              data={data}
              steps={steps}
              actions={actions}
              setSteps={setSteps}
              keys={["", "Selector", "Actions", "Value"]}
            />
          </>
        )}
      </MacScrollbar>
      {/* top */}
    </>
  );
};

export default CreateTestPage;
