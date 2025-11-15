import { useEffect, useRef, useState, useTransition } from "react";

import Card from "../../shared/ui/Card";
import { Input } from "../../shared/ui/Input";
import { checkLicense } from "../../server/licence/checkLicense";

function encrypt(text, key) {
  const cipher = crypto.createCipheriv(
    "aes-256-cbc", // Алгоритм шифрования
    Buffer.from(key.slice(0, 32)), // Ключ (обрезаем до 32 символов для AES-256)
    Buffer.alloc(16, 0) // Вектор инициализации (IV), заполненный нулями
  );
  let encrypted = cipher.update(text, "utf8", "hex"); // Шифруем текст
  encrypted += cipher.final("hex"); // Добавляем финальный блок
  return encrypted;
}

const LicenceKeyPage = () => {
  const ref = useRef();

  useEffect(() => {
    ref?.current?.focus();
  }, []);

  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({ licenseKey: "" });

  const [isPending, startTransition] = useTransition();

  const handleLicenseCheck = async () => {
    const res = await checkLicense(formData?.licenseKey);

    console.log(res, "assfuck");
    // // console.log(res);
    // setResult(res);
    // setPending(false);
    // if (!res?.error) {
    //   navigate(`/signin?email=${formData?.email}`);
    //   setRegisterStep(registerStep + 1);
    // }
  };

  const submitForm = async () => {
    startTransition(async () => {
      await handleLicenseCheck();
    });
  };

  return (
    <div className="w-full h-screen overflow-y-auto flex flex-col items-center justify-center gap-[36px] bg-[#F0F3FB]">
      <Card
        paddingTailwind="p-[12px]"
        roundedTailwind="rounded-[24px]"
        moreStyles="flex flex-col gap-[24px] max-w-[480px] h-fit w-full"
      >
        <p className="text-[#111] text-[24px] font-medium leading-[29px] tracking-[-4%]">
          Проверка лицензии
        </p>

        <Input
          ref={ref}
          disabled={isPending}
          label="Введите лицензионный ключ"
          placeholder="XXXXXXXXXXXXXX"
          paddingTailwind="px-[12px] py-[14px]"
          textTailwind="text-[15px] leading-[20px] tracking-[-2%] text-[#111]"
          borderTailwind="border-[1px] border-[#c6c6c6]"
          roundedTailwind="rounded-[12px]"
          value={formData?.licenseKey}
          onChange={(licenseKey) => setFormData({ licenseKey })}
          onEnterPress={submitForm}
          error={error?.licenseKey && error?.licenseKey[0]}
        />
      </Card>
    </div>
  );
};

export default LicenceKeyPage;
