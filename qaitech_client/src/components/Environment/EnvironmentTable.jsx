import { v4 as uuidv4 } from "uuid";

import { TrashIcon } from "../../shared/icons/TrashIcon";

const EnvironmentTable = ({ keys = [], steps = [], setSteps = () => {} }) => {
  return (
    <div
      // elevation={0}
      // style={{ border: "#515677", borderRadius: 8 }}
      className="h-fit flex flex-col"
    >
      {/* header */}
      <div className="flex flex-row sticky top-0 z-[50] w-full">
        {keys.map((i, index) => (
          <div
            key={index}
            className="flex flex-row bg-white text-accent-dark_purple"
            style={{
              borderLeft: index !== 0 ? "1px solid #515677" : "none",
              borderBottom: "1px solid #515677",
              // borderLeft: "",
              // color: "#7D7D7D",
              // background: "#fff",
              fontSize: "12px",
              letterSpacing: "-1%",
              lineHeight: "20px",
              fontWeight: 500,
              fontFamily: "Golos Text",
              paddingTop: 13,
              paddingBottom: 12,
              paddingRight: 9,
              paddingLeft: 9,
              width: index === 0 ? "4%" : "48%",
            }}
          >
            {i}
          </div>
        ))}
      </div>
      {/* header */}

      {/* body */}
      {steps.map((row, key) => (
        <div
          key={key}
          className="flex flex-row w-full border-b-[1px] border-[#515677]"
        >
          {/* index */}
          <div
            className="flex justify-center items-center text-accent-dark_purple"
            style={{
              textAlign: "center",
              borderLeft: "none",
              // color: "#7D7D7D",
              fontSize: "12px",
              letterSpacing: "-1%",
              lineHeight: "20px",
              fontWeight: 500,
              fontFamily: "Golos Text",
              padding: 0,
              width: "4%",
            }}
          >
            {key + 1}
          </div>
          {/* index */}

          {/* title */}
          <div
            className="text-accent-dark_purple"
            align={"left"}
            component="th"
            scope="row"
            style={{
              borderLeft: "1px solid #515677",
              // color: "#7D7D7D",
              fontSize: "12px",
              letterSpacing: "-1%",
              lineHeight: "20px",
              fontWeight: 500,
              fontFamily: "Golos Text",
              width: "48%",
            }}
          >
            <input
              id={`${key}input`}
              placeholder="Title"
              value={steps[key]?.title}
              onChange={(e) =>
                setSteps(
                  steps.map((i) =>
                    i?.id === row?.id
                      ? { ...i, title: e.target.value }
                      : { ...i }
                  )
                )
              }
              className="text-[10px] p-[9px] outline-none truncate placeholder:text-accent-dark_purple leading-[16px] tracking-[-1.5%] text-accent-purple bg-white w-full h-full"
            />
          </div>
          {/* title */}

          {/* selector */}
          <div
            style={{
              borderLeft: "1px solid #515677",
              color: "#7D7D7D",
              fontSize: "12px",
              letterSpacing: "-1%",
              lineHeight: "20px",
              fontWeight: 500,
              fontFamily: "Golos Text",
              padding: 0,
              width: "48%",
              display: "flex",
              flexDirection: "row",
              gap: 6,
              alignItems: "center",
              paddingRight: 22,
            }}
          >
            <input
              placeholder="Selector"
              value={steps[key]?.selector}
              onChange={(e) =>
                setSteps(
                  steps.map((i) =>
                    i?.id === row?.id
                      ? { ...i, selector: e.target.value }
                      : { ...i }
                  )
                )
              }
              className="text-[10px] px-[9px] truncate py-[14.5px] outline-none placeholder:text-accent-dark_purple leading-[16px] tracking-[-1.5%] text-accent-purple bg-white w-full h-full"
            />
            <TrashIcon
              onClick={() => setSteps(steps.filter((j) => j.id !== row?.id))}
            />
          </div>
          {/* selector */}
        </div>
      ))}
      {/* body */}

      {/* add newRow */}
      <div className="flex flex-row w-full">
        {/* index */}
        <div
          className="flex justify-center items-center"
          style={{
            textAlign: "center",
            borderLeft: "none",
            color: "#7D7D7D",
            fontSize: "12px",
            letterSpacing: "-1%",
            lineHeight: "20px",
            fontWeight: 500,
            fontFamily: "Golos Text",
            padding: 0,
            width: "4%",
          }}
        ></div>
        {/* index */}

        {/* title */}
        <div
          align={"left"}
          component="th"
          scope="row"
          className="pt-[13px] pb-[12px] px-[9px] cursor-pointer"
          style={{
            borderLeft: "1px solid #515677",
            color: "#99a5de",
            fontSize: "12px",
            letterSpacing: "-1%",
            lineHeight: "20px",
            fontWeight: 500,
            fontFamily: "Golos Text",
            width: "48%",
          }}
          onClick={() => {
            setSteps([
              ...steps,
              {
                id: uuidv4(),
                title: "",
                selector: "",
              },
            ]);
          }}
        >
          <p className="select-none">Add new web element</p>
        </div>
        {/* title */}

        {/* selector */}
        <div
          style={{
            borderLeft: "1px solid #515677",
            color: "#7D7D7D",
            fontSize: "12px",
            letterSpacing: "-1%",
            lineHeight: "20px",
            fontWeight: 500,
            fontFamily: "Golos Text",
            padding: 0,
            paddingLeft: 9,
            width: "48%",
          }}
        >
          {/* <DropDownTable items={data} keyLabel="title" value={"Element"} /> */}
        </div>
        {/* selector */}
      </div>
      {/* add newRow */}
    </div>
  );
};

export default EnvironmentTable;
