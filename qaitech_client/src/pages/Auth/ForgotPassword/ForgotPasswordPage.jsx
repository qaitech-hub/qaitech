import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import Code from "../../../components/SignUp/Code";
import FormSuccess from "../../../shared/ui/FormSuccess";
import Password from "../../../components/SignUp/Password";
import FormError from "../../../shared/ui/FormError";
import EmailForm from "../../../components/ForgotPassword/EmailForm";

import LogoIcon from "../../../shared/icons/logo/LogoIcon";

const ForgotPasswordPage = () => {
  const [registerStep, setRegisterStep] = useState(0);

  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({ email: "" });

  useEffect(() => {
    if (result?.message) toast.success(result?.message);

    if (result?.error) toast.error(result?.error);
  }, [result, error]);

  return (
    <div className="w-full h-screen overflow-y-auto flex flex-col items-center justify-center gap-[36px] bg-[#F0F3FB]">
      <LogoIcon />

      {/* экран авторизации */}
      {registerStep === 0 && (
        <EmailForm
          formData={formData}
          setFormData={setFormData}
          registerStep={registerStep}
          setRegisterStep={setRegisterStep}
          setResult={setResult}
          error={error}
          setError={setError}
        >
          {/* <FormSuccess message={result?.message} />
          <FormError message={result?.error} /> */}
        </EmailForm>
      )}
      {/* экран авторизации */}

      {/* экран подтверждения кода */}
      {registerStep === 1 && (
        <Code
          restorePassword
          registerStep={registerStep}
          setRegisterStep={setRegisterStep}
          setResult={setResult}
          error={error}
          setError={setError}
        >
          {/* <FormSuccess message={result?.message} />
          <FormError message={result?.error} /> */}
        </Code>
      )}
      {/* экран подтверждения кода */}

      {/* экран ввода пароля */}
      {registerStep === 2 && (
        <Password
          change
          email={formData?.email}
          setResult={setResult}
          error={error}
          setError={setError}
        >
          {/* <FormSuccess message={result?.message} />
          <FormError message={result?.error} /> */}
        </Password>
      )}
      {/* экран ввода пароля */}
    </div>
  );
};

export default ForgotPasswordPage;
