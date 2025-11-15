import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import Password from "../../../components/SignUp/Password";
import FormSuccess from "../../../shared/ui/FormSuccess";
import FormError from "../../../shared/ui/FormError";

import LogoWithTextIcon from "../../../shared/icons/logo/LogoWithTextIcon";

const CreatePasswordPage = () => {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (result?.message) toast.success(result?.message);

    if (result?.error) toast.error(result?.error);
  }, [result, error]);

  return (
    <div className="w-full h-screen overflow-y-auto flex flex-row p-[100px] items-center justify-between gap-[36px] bg-[#F0F3FB]">
      <LogoWithTextIcon />

      <Password error={error} setError={setError} setResult={setResult}>
        {/* <FormSuccess message={result?.message} />
        <FormError message={result?.error} /> */}
      </Password>
    </div>
  );
};

export default CreatePasswordPage;
