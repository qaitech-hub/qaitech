import { useEffect, useState } from "react";
import { Waypoint } from "react-waypoint";

import CustomLoader from "../../shared/ui/CustomLoader";
import WorkSpaceCard from "../../shared/ui/WorkSpaceCard";

import { getAllWorkSpaces } from "../../server/workspace/getAllWorkSpaces";
import { createWorkSpace } from "../../server/workspace/createWorkSpace";

const HomePage = () => {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState(null);
  const [cursor, setCursor] = useState("");
  const [hasNextPage, setHasNextPage] = useState(true);
  const [loading, setLoading] = useState(false);

  const getData = async (cursor) => {
    console.log("fetching");
    if (loading) return;
    setLoading(true);
    const res = await getAllWorkSpaces(cursor);
    console.log("client workspaces", res);

    if (!!res?.error) {
      setStatus(res);
      return;
    }

    if (cursor.length) {
      setData([...data, ...res.data]);
    } else {
      setData(res?.data);
    }

    setCursor(res.cursor);
    setHasNextPage(res.hasNextPage);
    setLoading(false);
  };

  useEffect(() => {
    setCursor("");
    getData("");
  }, [getAllWorkSpaces]);

  useEffect(() => {
    // Если авторизация отключена и воркспейсов нет, создаём автоматически
    if (
      process.env.REACT_APP_DISABLE_AUTH === "true" &&
      Array.isArray(data) &&
      data.length === 0 &&
      !loading
    ) {
      (async () => {
        await createWorkSpace({ title: "Main Workspace" });
        // После создания обновляем список
        getData("");
      })();
    }
  }, [data, loading]);

  return (
    <div className="w-full h-screen items-center justify-center">
      <div className="flex flex-col">
        <h1 className="text-[15px] text-accent-text font-medium text-center">
          Your workspaces:
        </h1>

        <div className="flex flex-col gap-[12px] max-w-[800px] w-full mx-auto">
          {!data ? (
            <div className="w-full flex justify-center items-center h-full">
              <CustomLoader diameter={36} />
            </div>
          ) : data?.length === 0 ? (
            <p className="mx-auto text-[red]">Нету воркспейсов</p>
          ) : (
            <>
              {data.map((item) => (
                <WorkSpaceCard key={item?.id} item={item} />
              ))}

              {hasNextPage ? (
                <Waypoint
                  onEnter={async () => {
                    console.log("Enter waypoint");
                    await getData(cursor);
                  }}
                  topOffset="50px"
                >
                  <div className="w-full flex  justify-center items-center h-full">
                    <CustomLoader diameter={36} />
                  </div>
                </Waypoint>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
