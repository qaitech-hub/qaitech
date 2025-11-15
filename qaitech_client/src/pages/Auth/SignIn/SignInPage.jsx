import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import SignIn from "../../../components/SignIn/SignIn";
import Code from "../../../components/SignUp/Code";

import LogoIcon from "../../../shared/icons/logo/LogoIcon";
import LogoHeaderIcon from "../../../shared/icons/logo/LogoHeaderIcon";

const SignInPage = () => {
  const [registerStep, setRegisterStep] = useState(0);

  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (result?.message) toast.success(result?.message);

    if (result?.error) toast.error(result?.error);
  }, [result, error]);

  return (
    <div className="w-full h-screen overflow-y-auto flex flex-col items-center justify-center gap-[36px] bg-[#080b1a]">
      <LogoHeaderIcon width={150} />

      {/* экран авторизации */}
      {registerStep === 0 && (
        <SignIn
          registerStep={registerStep}
          setRegisterStep={setRegisterStep}
          setResult={setResult}
          error={error}
          setError={setError}
        >
          {/* <FormSuccess message={result?.message} />
          <FormError message={result?.error} /> */}
        </SignIn>
      )}
      {/* экран авторизации */}

      {/* экран подтверждения кода */}
      {registerStep === 1 && (
        <Code
          verify
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
    </div>
  );
};

export default SignInPage;
