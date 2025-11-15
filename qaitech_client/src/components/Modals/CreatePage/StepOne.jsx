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

import { CreatePageSchema } from "../../../data/schemas";

import { getAllViewPorts } from "../../../server/viewport/getAllViewPorts";
import { createPage } from "../../../server/page/createPage";

import { PagesContext } from "../../../layouts/PagesContex";
import { getLlmConfig } from "../../../server/llm/getLlmConfig";

const StepOne = ({
  width = 690,
  handleClose = () => {},
  // setStep = () => {},
}) => {
  const params = useParams();
  const navigate = useNavigate();

  const { data, setData } = useContext(PagesContext);

  const [formData, setFormData] = useState({
    title: "",
    url: "",
    viewport: { title: "" },
    isAi: true,
  });
  const [viewPorts, setViewPorts] = useState(null);

  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingViewPorts, setLoadingViewPorts] = useState(false);

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

  // dropzone

  // получение вьюпортов
  const getViewPorts = async () => {
    try {
      setLoadingViewPorts(true);
      setStatus(null);

      const res = await getAllViewPorts();
      if (!res?.error) {
        setViewPorts(res);
        setLoadingViewPorts(false);
        // navigate(`/workspace/${res?.data?.id}`);
        return;
      }
      toast.error(res?.error);
      setStatus(res);

      handleClose(false);
    } catch (err) {
      setLoadingViewPorts(false);
      handleClose(false);

      toast.error("Something went wrong");
    }
  };
  // получение вьюпортов

  useEffect(() => {
    getViewPorts();
  }, []);

  const handleCreate = async () => {
    try {
      setLoading(true);
      setStatus(null);
      console.log(formData);

      const validatedFields = CreatePageSchema.safeParse({
        title: formData.title,
        url: formData.url,
      });
      if (
        !validatedFields?.success ||
        formData?.viewport?.title === "" ||
        (formData?.url === "" && acceptedFiles?.length === 0)
      ) {
        setLoading(false);

        if (formData?.viewport?.title === "") {
          if (formData?.url === "" && acceptedFiles?.length === 0)
            setStatus({
              ...validatedFields?.error?.formErrors?.fieldErrors,
              url: "Введите ссылку или файл",
              viewport: "Выберите вьюпорт",
            });
          else
            setStatus({
              ...validatedFields?.error?.formErrors?.fieldErrors,
              viewport: "Выберите вьюпорт",
            });
        } else {
          if (formData?.url === "" && acceptedFiles?.length === 0)
            setStatus({
              ...validatedFields?.error?.formErrors?.fieldErrors,
              url: "Введите ссылку или файл",
            });
          else setStatus(validatedFields?.error?.formErrors?.fieldErrors);
        }

        return;
      }

      console.log("validation good");

      const res = await createPage({
        ...formData,
        projectId: params?.workSpaceId,
        file: acceptedFiles,
      });
      console.log("fucking res: ", res);
      if (!!res?.error) {
        if (res?.details?.includes("AI parser failed, lets switch it")) {
          setFormData({ ...formData, isAi: false });
          toast.error("AI parser failed, lets switch it");
        } else toast.error(res?.error);

        setStatus(res);

        setLoading(false);
        return;
      }

      setData(
        [...data, res?.page]?.sort((a, b) =>
          a.title > b.title ? 1 : b.title > a.title ? -1 : 0
        )
      );
      toast.success(res?.message);
      handleClose(false);

      navigate(`/workspace/${params?.workSpaceId}`);
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

  if (loadingViewPorts)
    return (
      <div
        className="w-full h-full flex items-center justify-center"
        style={{ width }}
      >
        <CustomLoader
          size={36}
          color="rgba(153, 222, 175, 1)"
          secondaryColor="rgba(153, 222, 175, 0.6)"
        />
      </div>
    );

  return (
    <div className="grid grid-rows-[56px_468px_56px]" style={{ width }}>
      {/* header */}
      <div className="w-full flex items-center p-[12px]">
        <p className="font-medium select-none text-[24px] leading-[29px] tracking-[-4%] text-accent-purple">
          Import page
        </p>
      </div>
      {/* header */}

      {/* body */}
      <div className="w-full flex flex-col gap-[4px] p-[12px]">
        <Input
          label="page name"
          value={formData?.title}
          onChange={(title) => setFormData({ ...formData, title })}
          onEnterPress={handleCreate}
          placeholder="page title"
          labelTailwind="text-[12px] mb-[2px]"
          roundedTailwind="rounded-[12px]"
          errorTailwind="text-[12px] mt-[2px]"
          error={status?.title && status?.title}
        />

        <div className="flex flex-col w-full">
          <p className="text-accent-purple font-medium text-[12px] mb-[2px] select-none">
            page viewport
          </p>

          <DropDown
            keyLabel="title"
            items={viewPorts}
            onChange={(viewport) =>
              setFormData({ ...formData, viewport: viewport })
            }
            placeholder="viewports"
            value={formData?.viewport?.title}
            labelTailwind=""
            styled="w-full"
            roundedTailwind="rounded-[12px]"
            errorTailwind="text-[12px] mt-[2px]"
            textTailwind="text-accent-purple text-[10px] leading-[16px] tracking-[-1.5%]"
            bottomBlockCoef={36}
          />
        </div>

        <Input
          label="page url"
          value={formData?.url}
          onChange={(url) => setFormData({ ...formData, url })}
          onEnterPress={handleCreate}
          placeholder="paste URL"
          labelTailwind="text-[12px] mb-[2px]"
          roundedTailwind="rounded-[12px]"
          errorTailwind="text-[12px] mt-[2px]"
          error={status?.url && status?.url}
        />

        <p className="text-center select-none font-medium text-[16px] leading-[20px] text-[#99a5de] tracking-[-2%]">
          or
        </p>

        {/* // dropzone */}
        <div className="container bg-[#060314] bg-opacity-[90%] mt-0">
          <div
            {...getRootProps({ style })}
            className={`${
              !!status?.url && status.url[0] !== "Неверный формат ссылки"
                ? "border-[#F2A01B]"
                : acceptedFiles?.length > 0
                ? "border-[#41CC4F]"
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
          bgTailwind="bg-primary hover:bg-primary-hover"
          moreStyles="flex items-center justify-center"
        />
      </div>
      {/* footer */}
    </div>
  );
};

export default StepOne;
