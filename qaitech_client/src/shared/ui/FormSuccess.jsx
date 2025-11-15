import { SuccessIcon } from "../icons/SuccessIcon";

const FormSuccess = ({ message = null }) => {
  if (!message) return null;

  return (
    <div className="bg-emerald-500 dark:bg-opacity-50 p-[12px] rounded-[10px] flex items-center gap-[8px]">
      <SuccessIcon />
      <p className="text-[14px] text-destructive text-white select-none">
        {message}
      </p>
    </div>
  );
};

export default FormSuccess;
