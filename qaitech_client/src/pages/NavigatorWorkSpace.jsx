import { Route, Routes } from "react-router-dom";

import WorkSpaceNoPage from "./WorkSpaces/WorkSpaceNoPage";
import CreateTestPage from "./CreateTest/CreateTestPage";
import EmptyTestPage from "./Test/EmptyTestPage";
import TestPage from "./Test/TestPage";

const NavigatorWorkSpace = () => {
  return (
    <Routes>
      <Route path="" element={<WorkSpaceNoPage />} />
      <Route path="/create_test" element={<CreateTestPage />} />
      <Route path="/test" element={<EmptyTestPage />} />
      <Route path="/test/:testId" element={<TestPage />} />
    </Routes>
  );
};

export default NavigatorWorkSpace;
