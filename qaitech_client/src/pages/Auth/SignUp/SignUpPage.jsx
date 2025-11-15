import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import SignUp from "../../../components/SignUp/SignUp";
import Code from "../../../components/SignUp/Code";
import Password from "../../../components/SignUp/Password";

import LogoHeaderIcon from "../../../shared/icons/logo/LogoHeaderIcon";

const SignUpPage = () => {
  const [registerStep, setRegisterStep] = useState(0);

  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (result?.message) toast.success(result?.message);

    if (result?.error) toast.error(result?.error);
  }, [result, error]);

  return (
    <div className="w-full h-screen overflow-y-auto flex flex-row p-[100px] items-center justify-between gap-[36px] bg-[#080b1a]">
      <LogoHeaderIcon width={150} />

      {/* экран ввода эмаила и имени */}
      {registerStep === 0 && (
        <SignUp
          registerStep={registerStep}
          setRegisterStep={setRegisterStep}
          setResult={setResult}
          error={error}
          setError={setError}
        >
          {/* <FormSuccess message={result?.message} />
          <FormError message={result?.error} /> */}
        </SignUp>
      )}
      {/* экран ввода эмаила и имени */}

      {/* экран ввода кода */}
      {registerStep === 1 && (
        <Code
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
      {/* экран ввода кода */}

      {/* экран ввода пароля */}
      {registerStep === 2 && (
        <Password setResult={setResult} error={error} setError={setError}>
          {/* <FormSuccess message={result?.message} />
          <FormError message={result?.error} /> */}
        </Password>
      )}
      {/* экран ввода пароля */}
    </div>
  );
};

export default SignUpPage;
