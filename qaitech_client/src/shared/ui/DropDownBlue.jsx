import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import ArrowIcon from "../icons/ArrowIcon";

const DropDownBlue = ({
  keyLabel = "label",
  styled = "",
  items = [],
  value = {},
  placeholder = "",
  paddingTailwind = "py-[12px] px-[9px]",
  roundedTailwind = "rounded-[8px]",
  borderTailwind = "border-[1px] border-accent-purple",
  placeholderTailwind = "placeholder:text-accent-dark_purple",
  textTailwind = "text-[13px] leading-[16px] tracking-[-1%] font-medium text-purple",
  bottomBlockCoef = 42,
  onChange = () => {},
}) => {
  const ref = useRef();
  const DropDownBlueButton = useRef(null);
  const DropDownBlueTop =
    DropDownBlueButton?.current?.getBoundingClientRect()?.top;

  const [openState, setOpenState] = useState(false);
  const [input, setInput] = useState(value);
  const [filtered, setFiltered] = useState(items);

  useEffect(() => {
    if (value.length === 0) setInput("");
    else setInput(value);
  }, [value]);

  useEffect(() => {
    setFiltered(items);
  }, [openState]);

  return (
    <div className={`relative ${openState && "z-[500]"} ${styled}`}>
      <button
        type="button"
        ref={DropDownBlueButton}
        className={`${paddingTailwind} ${roundedTailwind} ${""} flex w-fit relative z-[41] flex-row items-center gap-[8px]
                ${openState === false ? "cursor-pointer" : "cursor-text"}`}
      >
        <div
          className="absolute left-0 top-0 w-full h-full z-[41]"
          onClick={() => {
            console.log("button");
            setOpenState(true);
          }}
        />

        <ArrowIcon
          active={openState}
          onClick={() => setOpenState(false)}
          color="stroke-accent-purple"
        />
        <input
          ref={ref}
          value={input}
          // onClick={() => {
          //   console.log("input");
          // }}
          onChange={(e) => {
            setInput(e.target.value);
            const newArr = items.filter((i) =>
              i[keyLabel].toLowerCase().includes(e.target.value.toLowerCase())
            );
            setFiltered(newArr);
          }}
          readOnly={openState === false}
          placeholder={placeholder}
          className={`${
            openState === false ? "cursor-pointer" : "cursor-text z-[41]"
          } outline-none truncate placeholder:select-none ${placeholderTailwind} bg-transparent w-fit ${textTailwind} text-accent-purple`}
        />
      </button>
      {/* нижняя хуйня */}
      <AnimatePresence>
        {openState && (
          <>
            <motion.div
              className="top-0 left-0 fixed w-full h-full z-[-1]"
              onClick={() => setOpenState(false)}
            />
            <motion.div
              className={`h-fit absolute w-full max-h-[200px] ${
                // это костыль, но он рабочий
                // чтобы дропдаун не упирался в низ экрана, я сверяю высоту списка опций относительно положения дропдауна и высоты экрана
                // формула снизу это КОСТЫЛЬ! Я считаю высоту списка
                // bottomBlockCoef - высота одного элемента. 200 - максимальная высота списка, 5 это отступ (поэтому 205)
                window.innerHeight - DropDownBlueTop <
                (bottomBlockCoef * items?.length > 201
                  ? 201
                  : 32 * items?.length)
                  ? "bottom-[calc(100%+1px)] top-auto"
                  : "bottom-auto top-[calc(100%+1px)]"
              } shadow-lg overflow-y-auto hideScrollbarNavMobile z-[41] bg-white ${borderTailwind} ${roundedTailwind}`}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.2 }}
            >
              {filtered?.length !== 0 ? (
                filtered?.map((item, key) => (
                  <div
                    key={key}
                    className={`${
                      item[keyLabel] === input && "bg-white"
                    } hover:bg-[#060314] hover:bg-opacity-[90%] z-[41] select-none bg-white hover:text-accent-purple cursor-pointer flex flex-col transition duration-[250ms] ${paddingTailwind} ${textTailwind} text-accent-purple`}
                    onClick={() => {
                      onChange(item);
                      setInput(item[keyLabel]);

                      setOpenState(false);
                    }}
                  >
                    {item[keyLabel]}
                  </div>
                ))
              ) : (
                <div
                  className={`flex rounded-b-[8px] bg-white select-none flex-col transition-colors duration-[250ms] ${paddingTailwind} font-normal ${textTailwind} text-accent-dark_purple`}
                  onClick={() => {
                    ref?.current?.focus();
                  }}
                >
                  Ничего не найдено
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
      {/* нижняя хуйня */}
    </div>
  );
};

export default DropDownBlue;
