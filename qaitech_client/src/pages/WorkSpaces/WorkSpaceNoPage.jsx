import { useParams, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState, useTransition } from "react";
import toast from "react-hot-toast";

import { Button } from "../../shared/ui/Button";
import { ModalContext } from "../../components/Modals/ModalHandlerWrap";
import { PagesContext } from "../../layouts/PagesContex";

import { generateTests } from "../../server/test/generateTests";

import LogoGrayIcon from "../../shared/icons/logo/LogoGrayIcon";
import MobileViewportIcon from "../../shared/icons/viewports/MobileViewportIcon";
import DesktopViewportIcon from "../../shared/icons/viewports/DesktopViewportIcon";
import TabletViewportIcon from "../../shared/icons/viewports/TabletViewportIcon";
import LogoHeaderIcon from "../../shared/icons/logo/LogoHeaderIcon";
import { getLlmConfig } from "../../server/llm/getLlmConfig";
import CustomLoader from "../../shared/ui/CustomLoader";

const WorkSpaceNoPage = () => {
  const { workSpaceId } = useParams();
  // const [searchParams, _] = useSearchParams();

  const navigate = useNavigate();

  const [loadingConfig, setLoadingConfig] = useState(true);
  const [isApiReady, setIsApiReady] = useState(false);

  const { setCreatePageModal, setPromtModal } = useContext(ModalContext);
  const { selectedPage, data } = useContext(PagesContext);

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

  if (data?.length === 0)
    return (
      <div className="flex flex-col gap-[36px] items-center justify-center w-full h-full">
        <Button
          text="Open Pages Overview"
          onClick={() => setCreatePageModal(true)}
          bgTailwind="bg-primary hover:bg-primary-hover   transition-colors duration-[250ms]"
          roundedTailwind="rounded-[12px]"
          paddingTailwind="px-[62px] py-[14px]"
          textTailwind="text-white"
        />
      </div>
    );

  if (!selectedPage || selectedPage?.projectId !== workSpaceId)
    return (
      <div className="flex flex-col gap-[36px] items-center justify-center w-full h-full">
        <p className="text-accent-dark_purple select-none text-[16px] leading-[16px] tracking-[-1%] text-center">
          Select page to start work
        </p>
      </div>
    );

  return (
    <div className="flex flex-col gap-[36px] items-center justify-center w-full h-full">
      {loadingConfig ? (
        <CustomLoader
          size={22}
          color="rgba(153, 222, 175, 1)"
          secondaryColor="rgba(153, 222, 175, 0.6)"
        />
      ) : (
        <>
          <Button
            text="Create Test"
            onClick={() => navigate("create_test")}
            bgTailwind="bg-accent-purple"
            roundedTailwind="rounded-[12px]"
            paddingTailwind="px-[79px] py-[14px]"
            textTailwind="text-white"
          />
          {isApiReady && (
            <Button
              text="AI tests generator"
              onClick={() => setPromtModal(true)}
              bgTailwind="bg-primary"
              roundedTailwind="rounded-[12px]"
              paddingTailwind="px-[79px] py-[14px]"
              textTailwind="text-white"
            />
          )}
        </>
      )}
    </div>
  );
};

export default WorkSpaceNoPage;
