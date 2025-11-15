import { useContext, useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useDropzone } from "react-dropzone";

import DropDown from "../../../shared/ui/DropDown";
import CustomLoader from "../../../shared/ui/CustomLoader";
import { Button } from "../../../shared/ui/Button";
import { Input } from "../../../shared/ui/Input";
import CheckBox from "../../../shared/ui/CheckBox";

import DropzoneIcon from "../../../shared/icons/DropzoneIcon";

import { CreatePageSchema, UrlPageSchema } from "../../../data/schemas";

import { getAllViewPorts } from "../../../server/viewport/getAllViewPorts";
import { createPage } from "../../../server/page/createPage";

import { PagesContext } from "../../../layouts/PagesContex";
import { importElements } from "../../../server/webelements/importElements";
import { getLlmConfig } from "../../../server/llm/getLlmConfig";

const StepOne = ({
  width = 690,
  handleClose = () => {},
  // setStep = () => {},
}) => {
  const params = useParams();
  const navigate = useNavigate();

  const { data, setData, selectedPage } = useContext(PagesContext);

  const [formData, setFormData] = useState({
    url: "",
    isAi: true,
  });

  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  // dropzone
  const {
    acceptedFiles,
    getRootProps,
    getInputProps,
    isFocused,
    isDragAccept,
    isDragReject,
  } = useDropzone({ accept: { "text/html": [] } });

  const baseStyle = {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "50px",
    borderWidth: 1.5,
    borderRadius: 12,
    backgroundColor: "transparent",
    outline: "none",
    transition: "border .1s ease-in-out",
    margin: "0px",
  };

  const focusedStyle = {
    borderColor: "rgba(153, 222, 175, 1)",
  };

  const acceptStyle = {
    borderColor: "rgba(153, 222, 175, 1)",
  };

  const rejectStyle = {
    borderColor: "#FFE1E1",
  };

  const style = useMemo(
    () => ({
      ...baseStyle,
      ...(isFocused ? focusedStyle : {}),
      ...(isDragAccept ? acceptStyle : {}),
      ...(isDragReject ? rejectStyle : {}),
    }),
    [isFocused, isDragAccept, isDragReject]
  );
  // dropzone

  const [loadingConfig, setLoadingConfig] = useState(true);
  const [isApiReady, setIsApiReady] = useState(false);
  // Загружаем существующую конфигурацию при открытии модала
  useEffect(() => {
    const loadConfig = async () => {
      try {
        setLoadingConfig(true);
        const config = await getLlmConfig();
        console.log(config);
        if (!(!config || !config.apiBaseUrl || !config.modelName)) {
          setIsApiReady(true);
        }
      } catch (err) {
        console.error("Failed to load LLM config:", err);
      } finally {
        setLoadingConfig(false);
      }
    };

    loadConfig();
  }, []);

  const handleCreate = async () => {
    try {
      setLoading(true);
      setStatus(null);
      console.log(formData);

      const validatedFields = UrlPageSchema.safeParse({
        url: formData.url,
      });

      if (formData?.url === "") {
        setLoading(false);
        setStatus({
          ...validatedFields?.error?.formErrors?.fieldErrors,
          url: "Введите ссылку",
        });
        return;
      }

      if (!validatedFields?.success) {
        setLoading(false);
        setStatus({
          ...validatedFields?.error?.formErrors?.fieldErrors,
        });
        return;
      }

      console.log("validation good");
      console.log(selectedPage, "sasa");

      const res = await importElements({
        ...formData,
        file: acceptedFiles,
        pageId: selectedPage?.id,
        viewport: selectedPage?.viewport?.title,
      });
      if (!!res?.error) {
        toast.error(res?.error);
        setStatus(res);
        setLoading(false);
        return;
      }

      setData(
        [...data, res?.page]?.sort((a, b) =>
          a.title > b.title ? 1 : b.title > a.title ? -1 : 0
        )
      );
      toast.success("Элементы успешно добавлены");
      handleClose(false);

      window.location.reload();
      return;
    } catch (err) {
      console.log("err: ", err);
      setLoading(false);

      toast.error("Something went wrong");
    }
  };

  console.log(status);
  useEffect(() => {
    setStatus(null);
  }, [acceptedFiles]);

  return (
    <div className="grid grid-rows-[56px_380.44px_56px]" style={{ width }}>
      {/* header */}
      <div className="w-full flex items-center p-[12px]">
        <p className="font-medium select-none text-[24px] leading-[29px] tracking-[-4%] text-gray-4300">
          Import elements
        </p>
      </div>
      {/* header */}

      {/* body */}
      <div className="w-full flex flex-col gap-[4px] p-[12px]">
        <Input
          label="page url"
          value={formData?.url}
          onChange={(url) => setFormData({ ...formData, url })}
          labelTailwind="text-[15px] leading-[20px] tracking-[-2%] font-medium mb-[8px]"
          onEnterPress={handleCreate}
          placeholder="paste URL"
          labelTailwind="text-[12px] mb-[2px]"
          roundedTailwind="rounded-[12px]"
          errorTailwind="text-[12px] mt-[2px]"
          errorTailwind="text-[15px] leading-[20px] tracking-[-2%] font-medium mt-[8px]"
          error={status?.url && status?.url}
        />

        <p className="text-center font-medium text-[16px] leading-[20px] text-[#99a5de] tracking-[-2%]">
          or
        </p>

        {/* // dropzone */}
        <div className="container bg-[#060314] bg-opacity-[90%] mt-0">
          <div
            {...getRootProps({ style })}
            className={`${
              !!status?.url && status.url[0] !== "Неверный формат ссылки"
                ? "border-warning"
                : acceptedFiles?.length > 0
                ? "border-success"
                : "border-[#99a5de]"
            } bg-[#060314] bg-opacity-[90%] mt-0`}
          >
            <input
              {...getInputProps()}
              className="bg-[#060314] bg-opacity-[90%] mt-0"
            />
            <DropzoneIcon
              accepted={acceptedFiles?.length > 0}
              color={
                // !!status?.url && status.url[0] !== "Неверный формат ссылки"
                // ? "#F2A01B"
                // :
                "#99a5de"
              }
            />
            <p
              className={`${
                // !!status?.url && status.url[0] !== "Неверный формат ссылки"
                // ? "text-[#F2A01B]"
                // :
                "text-accent-purple"
              } transition-colors duration-[150ms] mt-[12px] text-[24px] leading-[29px] tracking-[-4%] font-medium`}
            >
              {acceptedFiles?.length > 0
                ? "File accepted"
                : "Drop anywhere to import"}
            </p>
          </div>
        </div>
        {/* // dropzone */}
      </div>
      {/* body */}

      {/* footer */}
      <div className="flex flex-row items-center justify-between p-[12px]">
        <Button
          text="Cancel"
          onClick={() => handleClose(false)}
          roundedTailwind="rounded-[12px]"
        />

        {loadingConfig ? (
          <CustomLoader
            size={22}
            color="rgba(153, 222, 175, 1)"
            secondaryColor="rgba(153, 222, 175, 0.6)"
          />
        ) : (
          <>
            {isApiReady && (
              <div
                className="flex flex-row gap-[6px] items-center cursor-pointer"
                onClick={() =>
                  setFormData({ ...formData, isAi: !formData?.isAi })
                }
              >
                <p className="text-accent-text">with AI</p>

                <CheckBox active={formData?.isAi} />
              </div>
            )}
          </>
        )}

        <Button
          loading={loading}
          text="Ok"
          onClick={handleCreate}
          tailwindWidth="w-[103px]"
          paddingTailwind="py-[8px]"
          roundedTailwind="rounded-[12px]"
          textTailwind="text-white text-[10px] leading-[16px] tracking-[-1.5%] font-medium"
          bgTailwind="bg-primary hover:bg-primary-dark"
          moreStyles="flex items-center justify-center"
        />
      </div>
      {/* footer */}
    </div>
  );
};

export default StepOne;
