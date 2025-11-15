import { useEffect, useState } from "react";
import { MacScrollbar } from "mac-scrollbar";
import "mac-scrollbar/dist/mac-scrollbar.css";
import { Waypoint } from "react-waypoint";
import toast from "react-hot-toast";

import { Input } from "../../../shared/ui/Input";
import { Button } from "../../../shared/ui/Button";
import CustomLoader from "../../../shared/ui/CustomLoader";
import WorkSpaceCard from "../../../shared/ui/WorkSpaceCard";

import { getAllWorkSpaces } from "../../../server/workspace/getAllWorkSpaces";

const StepOne = ({ handleClose = () => {}, setStep = () => {}, width }) => {
  const [input, setInput] = useState("");

  const [data, setData] = useState(null);
  const [cursor, setCursor] = useState("");
  const [hasNextPage, setHasNextPage] = useState(true);
  const [loading, setLoading] = useState(false);

  const getData = async (cursor) => {
    // console.log("fetching");
    if (loading) return;
    setLoading(true);
    const res = await getAllWorkSpaces(cursor, input);
    // console.log("client workspaces", res);

    if (!!res?.error) {
      toast.error(res?.error);
      return;
    }

    if (cursor.length) setData([...data, ...res.data]);
    else setData(res?.data);

    setCursor(res.cursor);
    setHasNextPage(res.hasNextPage);
    setLoading(false);
  };

  useEffect(() => {
    setCursor("");
    getData("");
  }, [getAllWorkSpaces, input]);

  return (
    <div className="grid grid-rows-[56px_268px_56px]" style={{ width }}>
      {/* header */}
      <div className="w-full grid grid-cols-[calc(100%-200px)_200px] items-center p-[12px]">
        <p className="font-medium select-none text-[24px] leading-[29px] tracking-[-4%] text-accent-purple">
          Your workspaces
        </p>

        <Input
          value={input}
          onChange={setInput}
          placeholder="search"
          roundedTailwind="rounded-[12px]"
          borderTailwind="border-[1px] border-accent-purple"
          errorTailwind="hidden"
        />
      </div>
      {/* header */}

      {/* body */}
      <MacScrollbar
        skin="light"
        className="overflow-y-auto w-full h-full flex flex-col px-[12px] pb-[3px]"
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
          <div className="w-full flex justify-center">
            <CustomLoader
              size={22}
              color="rgba(153, 222, 175, 1)"
              secondaryColor="rgba(153, 222, 175, 0.6)"
            />
          </div>
        ) : data?.length === 0 ? (
          <p className="text-[13px] text-center text-gray-2300 leading-[22px] tracking-[-1%]">
            Nothing was found...
          </p>
        ) : (
          <>
            {data.map((item) => (
              <WorkSpaceCard
                key={item?.id}
                item={item}
                onClick={() => handleClose(false)}
              />
            ))}

            {hasNextPage ? (
              <Waypoint
                onEnter={async () => {
                  // console.log("Enter waypoint");
                  await getData(cursor);
                }}
                topOffset="50px"
              >
                <div className="w-full flex justify-center">
                  <CustomLoader
                    size={22}
                    color="success-light"
                    secondaryColor="success-light-transparent"
                  />
                </div>
              </Waypoint>
            ) : null}
          </>
        )}
      </MacScrollbar>
      {/* body */}

      {/* footer */}
      <div className="flex flex-row items-center justify-between p-[12px]">
        <Button
          text="Cancel"
          onClick={() => handleClose(false)}
          roundedTailwind="rounded-[12px]"
        />
        <Button
          text="Create Workspace"
          onClick={setStep}
          roundedTailwind="rounded-[12px]"
          textTailwind="text-white text-[10px] leading-[16px] tracking-[-1.5%] font-medium"
          bgTailwind="bg-primary hover:bg-primary-dark"
        />
      </div>
      {/* footer */}
    </div>
  );
};

export default StepOne;
