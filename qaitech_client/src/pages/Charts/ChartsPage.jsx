// import React from "react";
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend,
// } from "chart.js";
// import { Line } from "react-chartjs-2";

// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend
// );

// export const options = {
//   maintainAspectRatio: false,
//   responsive: true,
//   aspectRatio: 1,
//   plugins: {
//     legend: {
//       position: "top",
//     },
//     title: {
//       display: true,
//       text: "Chart.js Line Chart",
//     },
//   },
// };

// const labels = [
//   "January",
//   "February",
//   "March",
//   "April",
//   "May",
//   "June",
//   "July",
//   "March",
//   "April",
// ];

// export const data = {
//   labels,
//   datasets: [
//     {
//       label: "Dataset 1",
//       data: [90, 17, 888, 600],
//       borderColor: "rgb(255, 99, 132)",
//       backgroundColor: "rgba(255, 99, 132, 0.5)",
//     },
//     {
//       label: "Dataset 2",
//       data: [1000, 900, 20, 333],
//       borderColor: "rgb(53, 162, 235)",
//       backgroundColor: "rgba(53, 162, 235, 0.5)",
//     },
//   ],
// };

// const ChartsPage = () => {
//   return (
//     <div
//       style={{
//         height: "60vh",
//         position: "relative",
//         marginBottom: "1%",
//         padding: "1%",
//       }}
//     >
//       <Line options={options} data={data} />
//     </div>
//   );
// };

// export default ChartsPage;

import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

import storage from "../../storage/localStorage";

import SideBar from "../../components/Charts/SideBar";
// import ChartsPageId from "./ChartsPageId";

const ChartsPage = ({ defaultLayout = [20, 80] }) => {
  const onLayout = (sizes) => {
    storage.set("layout", JSON.stringify(sizes));
  };

  // console.log(JSON.parse(storage.get("layout")));

  return (
    <PanelGroup direction="horizontal" onLayout={onLayout}>
      {/* left */}
      <Panel
        maxSize={40}
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
        {/* <ChartsPageId /> */}ass
      </Panel>
      {/* right */}
    </PanelGroup>
  );
};

export default ChartsPage;
