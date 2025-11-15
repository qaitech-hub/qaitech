import { useSearchParams } from "react-router-dom";
import { useState } from "react";

import { CodeSchema } from "../../data/schemas";
import Card from "../../shared/ui/Card";
import { DigitsCodeInput } from "../../shared/ui/Input";
import { Button } from "../../shared/ui/Button";
import { checkCode } from "../../server/auth/checkCode";

const Code = ({
  verify = false,
  restorePassword = false,
  registerStep = 0,
  setRegisterStep = () => {},
  error = null,
  setError = () => {},
  setResult = () => {},
  children,
}) => {
  const [searchParams, _] = useSearchParams();

  const [isPending, setPending] = useState(false);
  const [formData, setFormData] = useState("");

  const handleCode = async (values) => {
    setPending(true);
    const res = await checkCode(
      {
        ...values,
        email: searchParams.get("email")?.toLowerCase(),
      },
      verify ? "verify" : restorePassword ? "confirm_restore" : "check_code"
    );
    setResult(res);
    setPending(false);

    if (!res?.error) {
      if (!verify) setRegisterStep(registerStep + 1);
      else if (!!verify && !restorePassword) window.location.reload();
      else window.location.reload();
    }
  };

  const submitForm = () => {
    const validatedFields = CodeSchema.safeParse({ code: formData });

    setError(null);
    setResult(null);

    if (!validatedFields.success) {
      setError(validatedFields?.error?.formErrors?.fieldErrors);
      return;
    }

    handleCode(validatedFields.data);
  };

  return (
    <Card
      paddingTailwind="p-[12px]"
      roundedTailwind="rounded-[24px]"
      moreStyles="flex flex-col gap-[24px] max-w-[480px] w-full"
    >
      <span className="text-gray-4300 text-[24px] font-medium leading-[29px] tracking-[-4%]">
        Sent code to{" "}
        <span className="text-primary">
          {searchParams.get("email")?.toLowerCase()}
        </span>
      </span>

      {children}

      <DigitsCodeInput
        label="Code"
        code={formData}
        setCode={setFormData}
        borderRadius={12}
        error={error?.code && error?.code[0]}
        onEnterPress={submitForm}
      />

      <Button
        loading={isPending}
        onClick={submitForm}
        tailwindWidth="w-full"
        bgTailwind="bg-primary hover:bg-primary-dark"
        textTailwind="text-[15px] mt-[16px] leading-[20px] tracking-[-2%] text-white text-center"
        roundedTailwind="rounded-[12px]"
        paddingTailwind="p-[14px]"
        text="Send Code"
        moreStyles="justify-center"
        loaderSize={20}
      />
    </Card>
  );
};

export default Code;
