import { motion, AnimatePresence } from "framer-motion";

const DropDownWithIcon = ({
  items = [],
  paddingTailwind = "py-[12px] px-[9px]",
  roundedTailwind = "rounded-[8px]",
  borderTailwind = "border-[1px] border-accent-purple",
  onChange = () => {},
  openState,
  setOpenState,
}) => {
  return (
    <AnimatePresence>
      {openState && (
        <>
          <motion.div
            className="top-0 left-0 fixed cursor-default w-full h-full z-[30]"
            onClick={() => setOpenState(false)}
          />
          <motion.div
            className={`h-fit absolute w-[200px] right-[6px] max-h-[200px] 
              top-[36px] shadow-lg overflow-y-auto hideScrollbarNavMobile z-[41] bg-white ${borderTailwind} ${roundedTailwind}`}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.2 }}
          >
            {items?.map((item, key) => (
              <div
                key={key}
                className={`hover:bg-[#060314] leading-[16px] tracking-[-1%] text-[14px] font-medium flex flex-row gap-[6px] items-center hover:bg-opacity-[90%] z-[41] select-none bg-white cursor-pointer transition duration-[250ms] ${paddingTailwind} ${item.textColor}`}
                onClick={() => {
                  onChange(item);
                  setOpenState(false);
                }}
              >
                {item?.icon ? item.icon : <></>}
                {item.name}
              </div>
            ))}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default DropDownWithIcon;
