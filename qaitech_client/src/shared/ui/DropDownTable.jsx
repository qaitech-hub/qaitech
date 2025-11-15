import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import ArrowIcon from "../icons/ArrowIcon";

const DropDownTable = ({
  keyLabel = "label",
  styled = "",
  items = [],
  value = {},
  placeholder = "",
  paddingTailwind = "pt-[13px] pb-[12px] px-[9px]",
  roundedTailwind = "rounded-[8px]",
  borderTailwind = "border-[0px] border-primary",
  placeholderTailwind = "placeholder:text-accent-dark_purple",
  textTailwind = "text-[10px] leading-[16px] tracking-[-1.5%] text-accent-purple",
  bottomBlockCoef = 42,
  onChange = () => {},
}) => {
  const ref = useRef();
  const DropDownTableButton = useRef(null);
  const DropDownTableTop =
    DropDownTableButton?.current?.getBoundingClientRect()?.top;

  const [openState, setOpenState] = useState(false);
  const [input, setInput] = useState(value);
  const [placeholderState, setPlaceholderState] = useState(placeholder);
  const [filtered, setFiltered] = useState(items);

  useEffect(() => {
    if (value.length === 0) setInput("");
    else setInput(value);
  }, [value]);

  useEffect(() => {
    setFiltered(items);

    if (openState === true) {
      ref.current.focus();
      setInput("");
      setPlaceholderState("Search");
    } else {
      setInput(value);
      setPlaceholderState(placeholder);
    }
  }, [openState]);

  return (
    <div className={`relative ${openState && "z-[500]"} ${styled}`}>
      <button
        type="button"
        ref={DropDownTableButton}
        className={`${paddingTailwind} ${roundedTailwind} ${borderTailwind} flex w-full relative ${
          openState ? "z-[41]" : "z-[1]"
        } flex-row items-center gap-[8px]
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
          placeholder={placeholderState}
          className={`${
            openState === false ? "cursor-pointer" : "cursor-text z-[41]"
          } outline-none truncate placeholder:select-none ${placeholderTailwind} bg-transparent w-full ${textTailwind}`}
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
                window.innerHeight - DropDownTableTop <
                (bottomBlockCoef * items?.length > 201
                  ? 201
                  : 32 * items?.length)
                  ? "bottom-[calc(100%+1px)] top-auto"
                  : "bottom-auto top-[calc(100%+1px)]"
              } shadow-lg overflow-y-auto hideScrollbarNavMobile bg-white border-[1px] border-accent-text z-[41] ${borderTailwind} ${roundedTailwind}`}
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
                    } hover:bg-[#060314] hover:bg-opacity-[90%] z-[41] select-none  cursor-pointer flex flex-col transition duration-[250ms] ${paddingTailwind} ${textTailwind}`}
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
                  className={`flex rounded-b-[8px]  select-none flex-col transition-colors duration-[250ms] ${paddingTailwind} font-normal ${textTailwind} text-[#8f8f8f]`}
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

export default DropDownTable;
