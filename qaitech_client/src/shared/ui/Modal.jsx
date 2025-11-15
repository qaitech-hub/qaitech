import { motion, AnimatePresence } from "framer-motion";

const Modal = ({
  width = 690,
  height = 380,
  top = 150,
  isOpen = false,
  handleClose = () => {},
  children,
  translate = "translate(-50%, 0%)",
  slideToTop = false,
  fadeAnim = false,
  z = 100,
}) => {
  const modalVariant = {
    initial: { opacity: 0 },
    isOpen: { opacity: 1 },
    exit: { opacity: 0 },
  };
  const containerVariant = {
    initial: fadeAnim
      ? { scale: 0.7, translateX: "-50%", top }
      : { top: "100%", transition: { type: "spring" } },
    isOpen: fadeAnim
      ? {
          scale: 1,
          translateX: "-50%",
          top,
        }
      : { top },
    exit: fadeAnim
      ? { scale: 0.7, translateX: "-50%", top }
      : { top: slideToTop ? "-100%" : "100%" },
  };

  // useEffect(() => {
  //   if (isOpen) document.body.style.overflow = "hidden";
  //   else document.body.style.overflow = "unset";
  // }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed [@media(pointer:coarse)]:hidden top-0 left-0 w-full h-full bg-[#060314] bg-opacity-[90%]"
            initial={"initial"}
            animate={"isOpen"}
            exit={"exit"}
            style={{ zIndex: z }}
            variants={modalVariant}
            onClick={() => handleClose(false)}
          ></motion.div>
          <motion.div
            className={`h-fit fixed bg-[#020413] border-[1px] border-primary z-[200] bottom-0 left-[50%] rounded-[24px] overflow-hidden`}
            initial={"initial"}
            animate={"isOpen"}
            exit={"exit"}
            variants={containerVariant}
            style={{ transform: translate, width, height }}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Modal;
