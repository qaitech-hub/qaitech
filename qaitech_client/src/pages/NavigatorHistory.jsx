import { Route, Routes } from "react-router-dom";

import HistoryId from "./History/HistoryId";
import WorkSpaceNoPage from "./WorkSpaces/WorkSpaceNoPage";

const NavigatorHistory = () => {
  return (
    <Routes>
      <Route path="" element={<WorkSpaceNoPage />} />
      <Route path=":reportId/" element={<HistoryId />} />
    </Routes>
  );
};

export default NavigatorHistory;
