import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import ArrowIcon from "../icons/ArrowIcon";

const DropDown = ({
  keyLabel = "label",
  styled = "",
  items = [],
  value = {},
  placeholder = "",
  paddingTailwind = "py-[8px] px-[12px]",
  roundedTailwind = "rounded-[8px]",
  borderTailwind = "border-[1px] border-accent-purple",
  placeholderTailwind = "placeholder:text-accent-dark_purple",
  textTailwind = "text-[10px] leading-[16px] tracking-[-1.5%] text-[#111]",
  bottomBlockCoef = 42,
  onChange = () => {},
}) => {
  const ref = useRef();
  const dropdownButton = useRef(null);
  const dropdownTop = dropdownButton?.current?.getBoundingClientRect()?.top;

  const [openState, setOpenState] = useState(false);
  const [input, setInput] = useState(value);
  const [filtered, setFiltered] = useState(items);

  useEffect(() => {
    if (value.length === 0) setInput("");
  }, [value]);

  useEffect(() => {
    setFiltered(items);
  }, [openState]);

  return (
    <div className={`relative ${openState && "z-[500]"} ${styled}`}>
      <button
        type="button"
        ref={dropdownButton}
        className={`${paddingTailwind} ${roundedTailwind} ${borderTailwind} flex w-full relative z-[41] flex-row items-center gap-[12px]
                ${openState === false ? "cursor-pointer" : "cursor-text"}`}
      >
        <div
          className="absolute left-0 top-0 w-full h-full z-[41]"
          onClick={() => {
            console.log("button");
            setOpenState(true);
          }}
        />
        <ArrowIcon active={openState} onClick={() => setOpenState(false)} />

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
          } outline-none bg-[#060314] bg-opacity-[90%]  placeholder:select-none ${placeholderTailwind} w-full ${textTailwind}`}
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
                window.innerHeight - dropdownTop <
                (bottomBlockCoef * items?.length > 205
                  ? 205
                  : 32 * items?.length)
                  ? "bottom-[calc(100%+5px)] top-auto"
                  : "bottom-auto top-[calc(100%+5px)]"
              } shadow-lg overflow-y-auto hideScrollbarNavMobile z-[41] ${borderTailwind} ${roundedTailwind}`}
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
                      item[keyLabel] === input && "bg-[#060314]"
                    }  z-[41] select-none bg-[#060314]  cursor-pointer flex flex-col transition-colors duration-[250ms] ${paddingTailwind} ${textTailwind}`}
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
                  className={`flex rounded-b-[8px] select-none flex-col transition-colors duration-[250ms] ${paddingTailwind} bg-[#060314] font-normal ${textTailwind} text-accent-dark_purple`}
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

export default DropDown;
