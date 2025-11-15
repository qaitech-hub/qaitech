// import { clamp, motion } from "framer-motion";

const ConfirmationModal = ({
  width = 690,
  confirmationCallback = { callBack: () => {} },
  setConfirmationModal = () => {},
}) => {
  return (
    <div className="relative h-full overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-fit flex flex-row">
        <div className="flex flex-col" style={{ width }}>
          {/* header */}
          <div className="w-full flex items-center p-[12px]">
            <p className="font-medium w-full select-none text-center text-[18px] leading-[29px] tracking-[-4%] text-gray-4300">
              Are you sure?
            </p>
          </div>
          {/* header */}

          <div className="flex flex-row justify-between gap-[20px] px-[24px]">
            <button
              onClick={() => {
                confirmationCallback.callBack("yes");
                setConfirmationModal(false);
              }}
              type="button"
              className="rounded-[12px] hover:bg-primary-hover w-full text-center transition-colors font-medium duration-[250ms] bg-primary text-[#080b1a]  text-[16px] px-[48px] py-[6px]"
            >
              Yes
            </button>
            <button
              onClick={() => {
                confirmationCallback.callBack("no");
                setConfirmationModal(false);
              }}
              type="button"
              className="rounded-[12px] hover:opacity-[70%] w-full text-center transition-opacity duration-[250ms] font-medium bg-[#fc2929] text-[#080b1a] text-[16px] px-[48px] py-[6px]"
            >
              No
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
