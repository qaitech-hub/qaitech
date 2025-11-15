import { useContext, useState, useTransition } from "react";

import { PromtSchema } from "../../../data/schemas";

import { TextareaAutoResize } from "../../../shared/ui/Input";
import { Button } from "../../../shared/ui/Button";
import toast from "react-hot-toast";
import { PagesContext } from "../../../layouts/PagesContex";
import { generateTests } from "../../../server/test/generateTests";

const PromptModal = ({ width = 690 }) => {
  const [error, setError] = useState(null);
  const { selectedPage, data } = useContext(PagesContext);

  const [formData, setFormData] = useState({
    promt: "",
  });
  const [isPending, startTransition] = useState(false);

  const submitForm = async () => {
    const validatedFields = PromtSchema.safeParse(formData);

    if (!validatedFields.success) {
      setError(validatedFields?.error?.formErrors?.fieldErrors);
      return;
    }

    setError(null);

    try {
      startTransition(true);
      if (!selectedPage?.id) {
        toast.error("Выберите страницу");

        return;
      }

      const res = await generateTests(selectedPage?.id, formData.promt || null);

      if (res?.success) {
        window.location.reload();
        return;
      }

      toast.error(res.error);
      startTransition(false);
      return;
    } catch (err) {
      startTransition(false);
      toast.error("Failed to save configuration");
      setError({ general: "Failed to save configuration" });
    }
  };

  return (
    <div className="relative h-full overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full flex flex-row">
        <div className="flex flex-col" style={{ width }}>
          {/* header */}
          <div className="w-full flex items-center p-[12px]">
            <p className="font-medium w-full select-none text-center text-[18px] leading-[29px] tracking-[-4%] text-gray-4300">
              Fill promt for AI model
            </p>
          </div>
          {/* header */}

          {/* body */}
          <div className="px-[12px] flex flex-col gap-[12px] h-full">
            {error?.general && (
              <div className="text-red-500 text-[12px]">{error.general}</div>
            )}
            <TextareaAutoResize
              label=""
              labelTailwind="text-[12px] mb-[2px]"
              placeholder="Prompt..."
              value={formData.promt}
              onChange={(promt) => setFormData({ ...formData, promt })}
              roundedTailwind="rounded-[12px]"
              errorTailwind="text-[12px] mt-[2px]"
              paddingTailwind="px-[12px] py-[12px]"
              style="min-h-[180px]"
              onEnterPress={submitForm}
              error={error?.promt && error?.promt[0]}
            />
          </div>
          {/* body */}

          <div className="flex flex-row justify-center p-[12px] mt-auto">
            <Button
              text={"Generate"}
              loading={isPending}
              roundedTailwind="rounded-[12px]"
              textTailwind="text-white text-[10px] leading-[16px] tracking-[-1.5%] font-medium"
              bgTailwind="bg-primary hover:bg-primary-dark"
              paddingTailwind="py-[8px] px-[36px]"
              onClick={submitForm}
              disabled={isPending}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptModal;
