import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { LoginSchema } from "../../data/schemas";
import { Button, ButtonLink } from "../../shared/ui/Button";
import Card from "../../shared/ui/Card";
import { Input } from "../../shared/ui/Input";

import { login } from "../../server/auth/login";

const SignIn = ({
  registerStep = 0,
  setRegisterStep = () => {},
  error = null,
  setError = () => {},
  setResult = () => {},
  children,
}) => {
  const navigate = useNavigate();
  const ref = useRef();
  const [isPending, setPending] = useState(false);

  const [formData, setFormData] = useState({ email: "", password: "" });

  useEffect(() => {
    ref?.current?.focus();
  }, []);

  const handleLogin = async (values) => {
    setPending(true);
    const res = await login(values);
    // console.log(res);
    setResult(res);
    setPending(false);

    if (!res?.error) {
      navigate(`/signin?email=${formData?.email}`);
      setRegisterStep(registerStep + 1);
    }
  };

  const submitForm = () => {
    const validatedFields = LoginSchema.safeParse(formData);

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
        <p className="text-gray-4300 text-[24px] font-medium leading-[29px] tracking-[-4%]">
          Sign in to QAITECH
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
          label="Password"
          type="password"
          labelTailwind="text-[12px] mb-[2px]"
          roundedTailwind="rounded-[12px]"
          errorTailwind="text-[12px] mt-[2px]"
          value={formData?.password}
          onChange={(password) => setFormData({ ...formData, password })}
          onEnterPress={submitForm}
          error={error?.password && error?.password[0]}
        />

        <div className="mt-[16px] flex flex-col gap-[12px] w-full">
          <ButtonLink
            text="Forgot password?"
            moreStyles="ml-auto"
            to={"/forgot_password"}
          />

          <Button
            loading={isPending}
            onClick={submitForm}
            tailwindWidth="w-full"
            bgTailwind="bg-primary hover:bg-primary-dark"
            textTailwind="text-[15px] leading-[20px] tracking-[-2%] text-white text-center"
            roundedTailwind="rounded-[12px]"
            paddingTailwind="p-[14px]"
            text="Verify"
            moreStyles="justify-center"
            loaderSize={20}
          />
        </div>
      </Card>

      <ButtonLink
        text="Create Account"
        moreStyles="text-center mt-[-12px]"
        to={"/signup"}
      />
    </>
  );
};

export default SignIn;
