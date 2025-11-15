import { ExclamationIcon } from "../icons/ExclamationIcon";

const FormError = ({ message = null }) => {
  if (!message) return null;

  return (
    <div className="bg-red-500 dark:bg-opacity-50 p-[12px] rounded-[10px] flex items-center gap-[8px]">
      <ExclamationIcon />
      <p className="text-[14px] text-destructive text-white select-none">
        {message}
      </p>
    </div>
  );
};

export default FormError;
