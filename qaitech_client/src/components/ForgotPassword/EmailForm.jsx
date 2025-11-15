import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { EmailSchema } from "../../data/schemas";
import { Button } from "../../shared/ui/Button";
import Card from "../../shared/ui/Card";
import { Input } from "../../shared/ui/Input";

import { restorePassword } from "../../server/auth/restorePassword";

const EmailForm = ({
  formData = { email: "" },
  setFormData = () => {},
  registerStep = 0,
  setRegisterStep = () => {},
  error = null,
  setError = () => {},
  setResult = () => {},
  children,
}) => {
  const navigate = useNavigate();
  const [isPending, setPending] = useState(false);

  const ref = useRef();

  useEffect(() => {
    ref?.current?.focus();
  }, []);

  const handleLogin = async (values) => {
    setPending(true);
    const res = await restorePassword(values);
    console.log(res);
    setResult(res);
    setPending(false);

    if (!res?.error) {
      navigate(`/forgot_password?email=${formData?.email}`);
      setRegisterStep(registerStep + 1);
    }
  };

  const submitForm = () => {
    const validatedFields = EmailSchema.safeParse(formData);

    if (!validatedFields.success) {
      setError(validatedFields?.error?.formErrors?.fieldErrors);
      return;
    }

    setError(null);
    setResult(null);

    handleLogin(validatedFields.data);
  };

  return (
    <>
      <Card
        paddingTailwind="p-[12px]"
        roundedTailwind="rounded-[24px]"
        moreStyles="flex flex-col gap-[24px] max-w-[480px] w-full"
      >
        <p className="text-[#111] text-[24px] font-medium leading-[29px] tracking-[-4%]">
          Forgot password?
        </p>

        {children}

        <Input
          ref={ref}
          disabled={isPending}
          label="Email"
          type="email"
          paddingTailwind="px-[12px] py-[14px]"
          textTailwind="text-[15px] leading-[20px] tracking-[-2%] text-[#111]"
          borderTailwind="border-[1px] border-[#c6c6c6]"
          roundedTailwind="rounded-[12px]"
          value={formData?.email}
          onChange={(email) => setFormData({ ...formData, email })}
          onEnterPress={submitForm}
          error={error?.email && error?.email[0]}
        />

        <Button
          loading={isPending}
          onClick={submitForm}
          tailwindWidth="w-full"
          bgTailwind="bg-primary hover:bg-primary-hover"
          textTailwind="text-[15px] leading-[20px] tracking-[-2%] text-[#fff] text-center"
          roundedTailwind="rounded-[12px]"
          paddingTailwind="p-[14px]"
          text="Confirm"
          moreStyles="justify-center"
          loaderSize={20}
        />
      </Card>
    </>
  );
};

export default EmailForm;
