import { AnimatePresence, motion } from "framer-motion";

const HoverModal = ({
  setHoverModal = () => {},
  hoverModal = false,
  itemsList = [],
}) => {
  return (
    <AnimatePresence>
      {hoverModal && (
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.7 }}
          transition={{ duration: 0.2 }}
          className="absolute pt-[33px] top-[12px] right-[0px] cursor-default z-[25] w-fit h-fit"
          onMouseEnter={() => setHoverModal(true)}
          onMouseLeave={() => setHoverModal(false)}
        >
          <div
            className={`h-full min-w-[170px] w-full whitespace-pre-line text-center bg-[#FFFFFF] transition-all duration-[250ms] dark:bg-[#2c2c2c] rounded-[12px] p-[8px] flex flex-col`}
          >
            {itemsList?.map((i, key) => (
              <div
                onClick={() => contactsCompState(i)}
                key={key}
                className={`p-[8px] flex flex-row cursor-pointer justify-between gap-[16px]`}
              >
                asswecant
                {/* <TextMain
                      text={i?.company?.name}
                      style={"text-[16px] text-start leading-[20px] break-keep"}
                    />

                    {i?.company?.id === contactsComp?.company?.id && (
                      <CheckIcon />
                    )} */}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default HoverModal;
