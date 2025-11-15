import { createContext, useState } from "react";

import Modal from "../../shared/ui/Modal";
import WorkSpaceModalHandler from "./WorkSpaceSteps/WorkSpaceModalHandler";
import CreatePageModalHandler from "./CreatePage/CreatePageModalHandler";
import ScreenShotsModalNewHandler from "./ScreenShotsModalNew/ScreenShotsModalNewHandler";
import ImportElementsModalHandler from "./ImportElements/ImportElementsModalHandler";
import ConfirmationModal from "./ConfirmationModal/ConfirmationModal";
import AiModal from "./AiModal/AiModal";
import PromptModal from "./PromptModal/PromptModal";

export const ModalContext = createContext();

const ModalHandlerWrap = ({ children }) => {
  const [workSpaceModal, setWorkSpaceModal] = useState(false);
  const [createPageModal, setCreatePageModal] = useState(false);
  const [importModal, setImportModal] = useState(false);
  const [screenshotModal, setScreenshotModal] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState(false);
  const [aiApiModal, setAiApiModal] = useState(false);
  const [promtModal, setPromtModal] = useState(false);

  const [image, setImage] = useState(null);

  const handleScreenshot = (img) => {
    setImage(img);

    setScreenshotModal(true);
  };

  const [confirmationCallback, setConfirmationCallback] = useState({
    callback: () => {},
  });
  const handleConfirmation = (callBack = () => {}) => {
    setConfirmationCallback({ callBack });
    setConfirmationModal(true);
  };

  return (
    <ModalContext.Provider
      value={{
        setWorkSpaceModal,
        createPageModal,
        setCreatePageModal,
        handleScreenshot,
        importModal,
        setImportModal,
        handleConfirmation,
        aiApiModal,
        setAiApiModal,
        promtModal,
        setPromtModal,
      }}
    >
      {children}

      <Modal
        width={720}
        height={380}
        top="calc(50% - 380px / 2)"
        isOpen={workSpaceModal}
        handleClose={setWorkSpaceModal}
      >
        <WorkSpaceModalHandler width={720} handleClose={setWorkSpaceModal} />
      </Modal>

      <Modal
        width={690}
        height={580}
        top="calc(50% - 580px / 2)"
        isOpen={createPageModal}
        handleClose={setCreatePageModal}
      >
        <CreatePageModalHandler width={690} handleClose={setCreatePageModal} />
      </Modal>

      <Modal
        width={690}
        height={492.44}
        top="calc(50% - 492.44px / 2)"
        isOpen={importModal}
        handleClose={setImportModal}
      >
        <ImportElementsModalHandler width={690} handleClose={setImportModal} />
      </Modal>

      <Modal
        width={350}
        height={115}
        top="calc(50% - 115px / 2)"
        isOpen={confirmationModal}
        handleClose={setConfirmationModal}
      >
        <ConfirmationModal
          width={690}
          confirmationCallback={confirmationCallback}
          setConfirmationModal={setConfirmationModal}
        />
      </Modal>

      <Modal
        width={500}
        height={337}
        top="calc(50% - 337px / 2)"
        isOpen={aiApiModal}
        handleClose={setAiApiModal}
      >
        <AiModal width={690} setAiApiModal={setAiApiModal} />
      </Modal>

      <Modal
        width={500}
        height={300}
        top="calc(50% - 300px / 2)"
        isOpen={promtModal}
        handleClose={setPromtModal}
      >
        <PromptModal width={690} setAiApiModal={setPromtModal} />
      </Modal>

      {screenshotModal && !!image && (
        <ScreenShotsModalNewHandler
          images={image?.arr}
          width={image?.width}
          height={image?.height}
          initialIndex={image?.initIndex}
          onClose={() => setScreenshotModal(false)}
        />
      )}
    </ModalContext.Provider>
  );
};

export default ModalHandlerWrap;
