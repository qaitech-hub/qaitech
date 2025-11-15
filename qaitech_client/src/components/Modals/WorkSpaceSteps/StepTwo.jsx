import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { WorkSpaceSchema } from "../../../data/schemas";
import { Input } from "../../../shared/ui/Input";
import { Button } from "../../../shared/ui/Button";

import { createWorkSpace } from "../../../server/workspace/createWorkSpace";

const StepTwo = ({
  handleClose = () => {},
  setStep = () => {},
  width = 720,
}) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ title: "" });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    try {
      setLoading(true);
      setStatus(null);

      const validatedFields = WorkSpaceSchema.safeParse(formData);
      if (!validatedFields?.success) {
        setLoading(false);
        setStatus(validatedFields?.error?.formErrors?.fieldErrors);
        return;
      }

      const res = await createWorkSpace(formData);

      if (!res?.error) {
        toast.success(res?.message);
        navigate(`/workspace/${res?.data?.id}`);
        handleClose(false);
        return;
      }
      toast.error(res?.error);
      setStatus(res);

      setLoading(false);
    } catch (err) {
      setLoading(false);

      toast.error("Something went wrong...");
    }
  };

  return (
    <div className="grid grid-rows-[56px_268px_56px]" style={{ width }}>
      {/* header */}
      <p className="font-medium w-full p-[12px] select-none text-[24px] leading-[29px] tracking-[-4%] text-accent-purple">
        Choose option for new worspace
      </p>
      {/* header */}

      {/* body */}
      <div className="w-full h-full flex flex-col p-[12px]">
        <Input
          value={formData?.title}
          onChange={(title) => setFormData({ ...formData, title })}
          onEnterPress={handleCreate}
          placeholder="title"
          textTailwind="text-gray-4300 text-[15px] leading-[20px] tracking-[-2%]"
          placeholderTailwind="text-accent-purple placeholder:text-accent-dark_purple"
          paddingTailwind="px-[12px] py-[6px]"
          roundedTailwind="rounded-[8px]"
          borderTailwind="border-[1px] border-accent-purple"
          errorTailwind="text-[15px] leading-[20px] tracking-[-2%]"
          error={status?.title && status?.title}
        />
      </div>
      {/* body */}

      {/* footer */}
      <div className="flex flex-row items-center p-[12px]">
        <Button
          text="Cancel"
          onClick={() => handleClose(false)}
          roundedTailwind="rounded-[12px]"
          moreStyles="mr-auto"
        />

        <Button
          text="Previous"
          onClick={setStep}
          roundedTailwind="rounded-[12px]"
          moreStyles="mr-[4px]"
        />
        <Button
          loading={loading}
          text="Ok"
          onClick={handleCreate}
          tailwindWidth="w-[103px]"
          paddingTailwind="py-[8px]"
          roundedTailwind="rounded-[12px]"
          textTailwind="text-white text-[10px] leading-[16px] tracking-[-1.5%] font-medium"
          bgTailwind="bg-primary hover:bg-primary-dark"
          moreStyles="flex items-center justify-center"
        />
      </div>
      {/* footer */}
    </div>
  );
};

export default StepTwo;
