import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { RegisterSchema } from "../../data/schemas";
import { Button, ButtonLink } from "../../shared/ui/Button";
import Card from "../../shared/ui/Card";
import { Input } from "../../shared/ui/Input";

import { register } from "../../server/auth/register";

const SignUp = ({
  registerStep = 0,
  setRegisterStep = () => {},
  error = null,
  setError = () => {},
  setResult = () => {},
  children,
}) => {
  const navigate = useNavigate();

  const ref = useRef();
  useEffect(() => {
    ref?.current?.focus();
  }, []);

  const [isPending, setPending] = useState(false);

  const [formData, setFormData] = useState({ email: "", username: "" });

  const handleRegister = async (values) => {
    setPending(true);
    const res = await register(values);
    setResult(res);
    setPending(false);

    if (!res?.error) {
      navigate(`/signup?email=${formData?.email}`);
      setRegisterStep(registerStep + 1);
    }
  };

  const submitForm = () => {
    const validatedFields = RegisterSchema.safeParse(formData);

    if (!validatedFields.success) {
      setError(validatedFields?.error?.formErrors?.fieldErrors);
      return;
    }

    setError(null);
    setResult(null);

    handleRegister(validatedFields.data);
  };

  return (
    <div className="max-w-[480px] w-full gap-[24px] flex flex-col">
      <Card
        paddingTailwind="p-[12px]"
        roundedTailwind="rounded-[24px]"
        moreStyles="flex flex-col gap-[24px] max-w-[480px] w-full"
      >
        <p className="text-gray-4300 text-[24px] font-medium leading-[29px] tracking-[-4%]">
          Create QAITECH account
        </p>

        {children}

        <Input
          ref={ref}
          disabled={isPending}
          label="Email"
          type="email"
          labelTailwind="text-[12px] mb-[2px]"
          roundedTailwind="rounded-[12px]"
          errorTailwind="text-[12px] mt-[2px]"
          value={formData?.email}
          onChange={(email) => setFormData({ ...formData, email })}
          onEnterPress={submitForm}
          error={error?.email && error?.email[0]}
        />
        <Input
          disabled={isPending}
          label="Username"
          labelTailwind="text-[12px] mb-[2px]"
          roundedTailwind="rounded-[12px]"
          errorTailwind="text-[12px] mt-[2px]"
          value={formData?.username}
          onChange={(username) => setFormData({ ...formData, username })}
          onEnterPress={submitForm}
          error={error?.username && error?.username[0]}
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

      <ButtonLink
        text="Sign In"
        moreStyles="text-center mt-[-12px]"
        to={"/signin"}
      />
    </div>
  );
};

export default SignUp;
