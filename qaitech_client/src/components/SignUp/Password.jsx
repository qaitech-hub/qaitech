import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

import { PasswordSchema } from "../../data/schemas";
import Card from "../../shared/ui/Card";
import { Input } from "../../shared/ui/Input";
import { Button } from "../../shared/ui/Button";
import { createPassword } from "../../server/auth/createPassword";
import { changePassword } from "../../server/auth/changePassword";

const Password = ({
  email = "",
  change = false,
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

  const [formData, setFormData] = useState({
    password: "",
    passwordSecond: "",
  });

  const handlePassword = async (values) => {
    setPending(true);
    const res = !change
      ? await createPassword(values)
      : await changePassword(values, email);
    setResult(res);
    setPending(false);

    console.log(res);

    if (!res?.error) {
      if (!change) window.location.reload();
      else navigate("/signin");
    }
  };

  const submitForm = () => {
    const validatedFields = PasswordSchema.safeParse(formData);

    setError(null);
    setResult(null);

    if (!validatedFields.success) {
      setError(validatedFields?.error?.formErrors?.fieldErrors);
      return;
    }

    if (formData?.password !== formData?.passwordSecond) {
      setError({ passwordSecond: ["Пароли не совпадают"] });
      return;
    }

    handlePassword(validatedFields.data);
  };

  return (
    <Card
      paddingTailwind="p-[12px]"
      roundedTailwind="rounded-[24px]"
      moreStyles="flex flex-col gap-[24px] max-w-[480px] w-full"
    >
      <p className="text-gray-4300 text-[24px] font-medium leading-[29px] tracking-[-4%]">
        Create a password
      </p>

      {children}

      <Input
        ref={ref}
        disabled={isPending}
        // label="Email"
        type="password"
        placeholder="must be 8 characters"
        labelTailwind="text-[12px] mb-[2px]"
        roundedTailwind="rounded-[12px]"
        errorTailwind="text-[12px] mt-[2px]"
        value={formData?.password}
        onChange={(password) => setFormData({ ...formData, password })}
        onEnterPress={submitForm}
        error={error?.password && error?.password[0]}
      />
      <Input
        disabled={isPending}
        // label="passwordSecond"
        type="password"
        placeholder="repeat password"
        labelTailwind="text-[12px] mb-[2px]"
        roundedTailwind="rounded-[12px]"
        errorTailwind="text-[12px] mt-[2px]"
        value={formData?.passwordSecond}
        onChange={(passwordSecond) =>
          setFormData({ ...formData, passwordSecond })
        }
        onEnterPress={submitForm}
        error={error?.passwordSecond && error?.passwordSecond[0]}
      />

      <Button
        loading={isPending}
        onClick={submitForm}
        tailwindWidth="w-full"
        bgTailwind="bg-primary hover:bg-primary-dark"
        textTailwind="text-[15px] mt-[16px] leading-[20px] tracking-[-2%] text-white text-center"
        roundedTailwind="rounded-[12px]"
        paddingTailwind="p-[14px]"
        text="Log In"
        moreStyles="justify-center"
        loaderSize={20}
      />
    </Card>
  );
};

export default Password;
