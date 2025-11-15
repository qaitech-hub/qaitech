import { useState, useEffect } from "react";

import { AiModelSchema } from "../../../data/schemas";
import { getLlmConfig } from "../../../server/llm/getLlmConfig";
import { updateLlmConfig } from "../../../server/llm/updateLlmConfig";

import { Input } from "../../../shared/ui/Input";
import { Button } from "../../../shared/ui/Button";
import toast from "react-hot-toast";
import CustomLoader from "../../../shared/ui/CustomLoader";
import { useLocation } from "react-router-dom";
import storage from "../../../storage/localStorage";

const AiModal = ({ width = 690, setAiApiModal = () => {} }) => {
  const { pathname } = useLocation();

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [formData, setFormData] = useState({
    modelName: "",
    modelUrl: "",
    token: "",
  });

  // Загружаем существующую конфигурацию при открытии модала
  useEffect(() => {
    const loadConfig = async () => {
      try {
        setLoadingConfig(true);
        const config = await getLlmConfig();
        console.log(config);
        if (config && !config.error) {
          setFormData({
            modelName: config.modelName || "",
            modelUrl: config.apiBaseUrl || "",
            token: config.apiKey || "", // Не показываем реальный токен
          });
        }
      } catch (err) {
        console.error("Failed to load LLM config:", err);
      } finally {
        setLoadingConfig(false);
      }
    };

    loadConfig();
  }, []);

  const submitForm = async () => {
    const validatedFields = AiModelSchema.safeParse(formData);

    if (!validatedFields.success) {
      setError(validatedFields?.error?.formErrors?.fieldErrors);
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const result = await updateLlmConfig({
        apiKey: formData.token,
        modelName: formData.modelName,
        apiBaseUrl: formData.modelUrl,
      });

      if (result?.error) {
        toast.error(result.error);
        setError({ general: result.error });
        setLoading(false);
        return;
      }

      toast.success("LLM configuration saved");
      setAiApiModal(false);

      window.location.reload();
    } catch (err) {
      toast.error("Failed to save configuration");
      setError({ general: "Failed to save configuration" });
    } finally {
      setLoading(false);
    }
  };

  if (loadingConfig) {
    return (
      <div className="flex items-center justify-center h-full">
        <CustomLoader />
      </div>
    );
  }

  return (
    <div className="relative h-full overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full flex flex-row">
        <div className="flex flex-col" style={{ width }}>
          {/* header */}
          <div className="w-full flex items-center p-[12px]">
            <p className="font-medium w-full select-none text-center text-[18px] leading-[29px] tracking-[-4%] text-gray-4300">
              Fill AI model data
            </p>
          </div>
          {/* header */}

          {/* body */}
          <div className="px-[12px] flex flex-col gap-[12px] h-full">
            {error?.general && (
              <div className="text-red-500 text-[12px]">{error.general}</div>
            )}
            <Input
              label="model name"
              labelTailwind="text-[12px] mb-[2px]"
              placeholder="model name"
              value={formData.modelName}
              onChange={(modelName) => setFormData({ ...formData, modelName })}
              roundedTailwind="rounded-[12px]"
              errorTailwind="text-[12px] mt-[2px]"
              onEnterPress={submitForm}
              error={error?.modelName && error?.modelName[0]}
            />
            <Input
              label="model url"
              labelTailwind="text-[12px] mb-[2px]"
              placeholder="model url"
              value={formData.modelUrl}
              onChange={(modelUrl) => setFormData({ ...formData, modelUrl })}
              roundedTailwind="rounded-[12px]"
              errorTailwind="text-[12px] mt-[2px]"
              onEnterPress={submitForm}
              error={error?.modelUrl && error?.modelUrl[0]}
            />
            <Input
              label="model token"
              labelTailwind="text-[12px] mb-[2px]"
              placeholder="model token"
              value={formData.token}
              onChange={(token) => setFormData({ ...formData, token })}
              roundedTailwind="rounded-[12px]"
              errorTailwind="text-[12px] mt-[2px]"
              onEnterPress={submitForm}
              error={error?.token && error?.token[0]}
            />
          </div>
          {/* body */}

          <div className="flex flex-row justify-center p-[12px] mt-auto">
            <Button
              text={loading ? "Saving..." : "Save"}
              roundedTailwind="rounded-[12px]"
              textTailwind="text-white text-[10px] leading-[16px] tracking-[-1.5%] font-medium"
              bgTailwind="bg-primary hover:bg-primary-dark"
              paddingTailwind="py-[8px] px-[36px]"
              onClick={submitForm}
              disabled={loading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiModal;
