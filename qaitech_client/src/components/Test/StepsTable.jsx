import { useContext } from "react";

import { ModalContext } from "../Modals/ModalHandlerWrap";

const StepsTable = ({ steps = [] }) => {
  const { handleScreenshot } = useContext(ModalContext);

  const screenshots = steps?.map((i) => i?.Screenshot?.data);

  return (
    <div
      // elevation={0}
      // style={{ border: "#515677", borderRadius: 8 }}
      className="h-fit flex flex-col"
    >
      {/* body */}
      {steps.map((row, key) => (
        <div
          key={key}
          className={`flex flex-row w-full ${
            key !== steps?.length - 1 && "border-b-[1px]"
          } border-accent-purple`}
        >
          {/* index */}
          <div
            className="flex justify-center items-center text-accent-dark_purple"
            style={{
              textAlign: "center",
              borderLeft: "none",
              fontSize: "12px",
              letterSpacing: "-1%",
              lineHeight: "20px",
              fontWeight: 500,
              fontFamily: "Golos Text",
              padding: 12,
              width: "4%",
            }}
          >
            {key + 1}
          </div>
          {/* index */}

          {/* title */}
          <div
            align={"left"}
            component="th"
            scope="row"
            className="text-accent-dark_purple"
            style={{
              borderLeft: "1px solid #515677",
              paddingLeft: 22,
              paddingRight: 22,
              wordBreak: "break-all",
              fontSize: "12px",
              letterSpacing: "-1%",
              lineHeight: "20px",
              padding: 12,
              fontWeight: 500,
              fontFamily: "Golos Text",
              width: "76%",
            }}
          >
            {row.value}
          </div>
          {/* title */}

          {/* selector */}
          <div
            style={{
              borderLeft: "1px solid #515677",
              color: row.status === true ? "#41CC4F" : "#E24444",
              paddingLeft: 22,
              wordBreak: "break-all",
              fontSize: "12px",
              letterSpacing: "-1%",
              lineHeight: "20px",
              fontWeight: 500,
              fontFamily: "Golos Text",
              width: "20%",
              padding: 12,
              display: "flex",
              flexDirection: "row",
              gap: 6,
              alignItems: "center",
              paddingRight: 22,
              justifyContent: "space-between",
              wordBreak: "keep-all",
            }}
          >
            {row.status === true ? "Done" : "Failed"}

            <button
              type="button"
              className="text-primary min-w-[115px] font-normal text-[12px] leading-[20px] tracking-[-1%]"
              onClick={() =>
                handleScreenshot({
                  arr: screenshots,
                  initIndex: key,
                })
              }
            >
              Open screenshot
            </button>
          </div>
          {/* selector */}
        </div>
      ))}
      {/* body */}
    </div>
  );
};

export default StepsTable;
