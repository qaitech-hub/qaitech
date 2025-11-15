import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

import storage from "../../storage/localStorage";

import SideBar from "../../components/Environment/SideBar";
import RunPageId from "./RunPageId";

const RunPage = ({ defaultLayout = [20, 80] }) => {
  const onLayout = (sizes) => {
    storage.set("layout", JSON.stringify(sizes));
  };

  // console.log(JSON.parse(storage.get("layout")));

  return (
    <PanelGroup direction="horizontal" onLayout={onLayout}>
      {/* left */}
      <Panel
        maxSize={40}
        minSize={25}
        defaultSize={
          storage.get("layout")
            ? JSON.parse(storage.get("layout"))[0]
            : defaultLayout[0]
        }
        className="h-full grid grid-rows-[48px_calc(100%-48px)]"
        // minSize={30}
      >
        <SideBar />
      </Panel>
      {/* left */}

      <PanelResizeHandle className="w-[1px] h-full border-primary border-r-[1px] cursor-w-resize" />

      {/* right */}
      <Panel
        defaultSize={
          storage.get("layout")
            ? JSON.parse(storage.get("layout"))[1]
            : defaultLayout[1]
        }
      >
        <RunPageId />
      </Panel>
      {/* right */}
    </PanelGroup>
  );
};

export default RunPage;
