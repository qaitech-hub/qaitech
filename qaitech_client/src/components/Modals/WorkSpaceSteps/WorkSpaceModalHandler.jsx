import { useState } from "react";
import { clamp, motion } from "framer-motion";

import StepOne from "./StepOne";
import StepTwo from "./StepTwo";

const WorkSpaceModalHandler = ({ handleClose = () => {}, width = 720 }) => {
  const [step, setStep] = useState(0);

  return (
    <div className="relative h-full overflow-hidden">
      <motion.div
        className="absolute top-0 left-0 w-full h-full flex flex-row"
        style={{ width: width * 2 }}
        animate={{
          x: -1 * step * width,
        }}
        transition={{
          x: { duration: 0.25, type: "spring", bounce: 0.2 },
        }}
      >
        <StepOne
          width={width}
          handleClose={handleClose}
          setStep={() => setStep((step) => clamp(step + 1, 1, 1))}
        />
        <StepTwo
          width={width}
          handleClose={handleClose}
          setStep={() => setStep((step) => clamp(step - 1, 0, 1))}
        />
      </motion.div>
    </div>
  );
};

export default WorkSpaceModalHandler;
