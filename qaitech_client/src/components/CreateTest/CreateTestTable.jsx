import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { v4 as uuidv4 } from "uuid";

import DropDownTable from "../../shared/ui/DropDownTable";

import { TrashIcon } from "../../shared/icons/TrashIcon";
import ArrowIcon from "../../shared/icons/ArrowIcon";

const CreateTestTable = ({
  data = [],
  keys = [],
  actions = [],
  steps = [],
  setSteps = () => {},
}) => {
  const [isHovered, setIsHovered] = useState(null);

  const handlePosition = async (element = {}, nextElement = {}) => {
    setSteps(
      steps.map((i) =>
        i?.id === element?.id
          ? {
              ...i,
              value: nextElement.value,
              webElement: nextElement.webElement,
              element: nextElement.element,
              action: nextElement.action,
            }
          : i?.id === nextElement?.id
          ? {
              ...i,
              value: element.value,
              webElement: element.webElement,
              element: element.element,
              action: element.action,
            }
          : { ...i }
      )
    );
  };

  return (
    <div
      // elevation={0}
      // style={{ border: "#515677", borderRadius: 8 }}
      className="h-fit flex flex-col"
    >
      {/* header */}
      <div className="flex flex-row sticky top-0 z-[40] w-full bg-white">
        {keys.map((i, index) => (
          <div
            key={index}
            className="flex flex-row text-accent-dark_purple"
            style={{
              borderLeft: index !== 0 ? "1px solid #515677" : "none",
              borderBottom: "1px solid #515677",
              background: "transparent",
              fontSize: "12px",
              letterSpacing: "-1%",
              lineHeight: "20px",
              fontWeight: 500,
              fontFamily: "Golos Text",
              paddingTop: 13,
              paddingBottom: 12,
              paddingRighft: 9,
              paddingLeft: 9,
              width: index === 0 ? "4%" : "32%",
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
          className="flex flex-row w-full border-b-[1px] border-accent-dark_purple"
          onMouseEnter={() => setIsHovered(steps[key].id)}
          onMouseLeave={() => setIsHovered(null)}
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
              padding: 0,
              width: "4%",
            }}
          >
            <AnimatePresence>
              {isHovered === steps[key].id ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ ease: "easeOut" }}
                  className="flex flex-col"
                >
                  {key !== 0 && (
                    <ArrowIcon
                      pointer
                      active
                      size={15}
                      color="stroke-primary group-hover:stroke-primary-hover transition-colors duration-[250ms]"
                      onClick={() => handlePosition(steps[key], steps[key - 1])}
                    />
                  )}
                  {key !== steps?.length - 1 && (
                    <ArrowIcon
                      pointer
                      size={15}
                      color="stroke-primary group-hover:stroke-primary-hover transition-colors duration-[250ms]"
                      onClick={() => handlePosition(steps[key], steps[key + 1])}
                    />
                  )}
                </motion.div>
              ) : (
                <motion.p
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ ease: "easeOut" }}
                >
                  {key + 1}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
          {/* index */}

          {/* selector */}
          <div
            style={{
              borderLeft: "1px solid #515677",
              fontSize: "12px",
              letterSpacing: "-1%",
              lineHeight: "20px",
              fontWeight: 500,
              fontFamily: "Golos Text",
              padding: 0,
              paddingLeft: 9,
              width: "32%",
            }}
          >
            <DropDownTable
              items={data}
              keyLabel="title"
              value={steps[key].element.title || "Element"}
              onChange={(element) =>
                setSteps(
                  steps.map((i) =>
                    i?.id === row?.id ? { ...i, element } : { ...i }
                  )
                )
              }
            />
          </div>
          {/* selector */}

          {/* actions */}
          <div
            align={"left"}
            component="th"
            scope="row"
            style={{
              borderLeft: "1px solid #515677",
              color: "#7D7D7D",
              fontSize: "12px",
              letterSpacing: "-1%",
              lineHeight: "20px",
              fontWeight: 500,
              fontFamily: "Golos Text",
              padding: 0,
              width: "32%",
            }}
          >
            <DropDownTable
              items={actions}
              keyLabel="name"
              value={steps[key].action?.name || "Actions"}
              onChange={(action) =>
                setSteps(
                  steps.map((i) =>
                    i?.id === row?.id ? { ...i, action: action } : { ...i }
                  )
                )
              }
            />
          </div>
          {/* actions */}

          {/* title */}
          <div
            align={"left"}
            className="text-accent-purple"
            component="th"
            scope="row"
            style={{
              borderLeft: "1px solid #515677",
              fontSize: "12px",
              letterSpacing: "-1%",
              lineHeight: "20px",
              fontWeight: 500,
              fontFamily: "Golos Text",
              width: "32%",
              display: "flex",
              flexDirection: "row",
              gap: 6,
              alignItems: "center",
              paddingRight: 22,
            }}
          >
            {!!steps[key].action?.name &&
            steps[key].action?.withValue === false ? (
              <>
                <TrashIcon
                  onClick={() =>
                    setSteps(steps.filter((j) => j.id !== row?.id))
                  }
                  style="ml-auto"
                />
              </>
            ) : (
              <>
                <input
                  disabled={
                    !!steps[key].action?.name &&
                    steps[key].action?.withValue === false
                  }
                  placeholder="Value"
                  value={steps[key]?.value}
                  onChange={(e) =>
                    setSteps(
                      steps.map((i) =>
                        i?.id === row?.id
                          ? { ...i, value: e.target.value }
                          : { ...i }
                      )
                    )
                  }
                  className="text-[10px] p-[9px] outline-none placeholder:text-accent-dark_purple leading-[16px] tracking-[-1.5%] text-accent-purple bg-transparent truncate w-full h-full"
                />

                <TrashIcon
                  onClick={() =>
                    setSteps(steps.filter((j) => j.id !== row?.id))
                  }
                />
              </>
            )}
          </div>
          {/* title */}
        </div>
      ))}
      {/* body */}

      {/* add newRow */}
      <div className="flex flex-row w-full">
        {/* index */}
        <div
          className="flex justify-center items-center text-accent-purple"
          style={{
            textAlign: "center",
            borderLeft: "none",
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

        {/* selector */}
        <div
          className="pt-[13px] pb-[12px] px-[9px] cursor-pointer text-accent-dark_purple"
          style={{
            borderLeft: "1px solid #515677",
            fontSize: "12px",
            letterSpacing: "-1%",
            lineHeight: "20px",
            fontWeight: 500,
            fontFamily: "Golos Text",
            width: "32%",
          }}
          onClick={() =>
            setSteps([
              ...steps,
              {
                id: uuidv4(),
                element: { title: "" },
                action: { name: "" },
                value: "",
              },
            ])
          }
        >
          <p className="select-none">Add new step</p>
          {/* <DropDownTable items={data} keyLabel="title" value={"Element"} /> */}
        </div>
        {/* selector */}

        {/* actions */}
        <div
          className="text-accent-purple"
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
            padding: 0,
            width: "32%",
          }}
        ></div>
        {/* actions */}

        {/* title */}
        <div
          className="text-accent-purple"
          align={"left"}
          component="th"
          scope="row"
          style={{
            borderLeft: "1px solid #515677",
            fontSize: "12px",
            letterSpacing: "-1%",
            lineHeight: "20px",
            fontWeight: 500,
            fontFamily: "Golos Text",
            padding: 0,
            paddingLeft: 9,
            width: "32%",
          }}
        ></div>
        {/* title */}
      </div>
      {/* add newRow */}
    </div>
  );
};

export default CreateTestTable;
