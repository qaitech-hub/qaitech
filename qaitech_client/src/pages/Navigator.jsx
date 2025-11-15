import { Routes, Route } from "react-router-dom";

import { Layout } from "../layouts/Layout";

import SignInPage from "./Auth/SignIn/SignInPage";
import SignUpPage from "./Auth/SignUp/SignUpPage";
import ForgotPasswordPage from "./Auth/ForgotPassword/ForgotPasswordPage";
import CreatePasswordPage from "./Auth/CreatePassword/CreatePasswordPage";
import WorkSpacePage from "./WorkSpaces/WorkSpacePage";
import HomePage from "./Home/HomePage";
import EnvironmentPage from "./Environment/EnvironmentPage";
import HistoryPage from "./History/HistoryPage";
import LandingPage from "./Landing/LandingPage";
import RunPage from "./Run/RunPage";
import LicenceKeyPage from "./LicenceKey/LicenceKeyPage";

const Navigator = () => {
  return (
    <Routes>
      <Route path="/" element={<a href="/signin">to auth</a>} />
      <Route path="/landing" element={<LandingPage />} />
      <Route path="/home" element={<HomePage />} />

      {/* licence */}
      <Route path="/licence" element={<LicenceKeyPage />} />
      {/* licence */}

      {/* auth */}
      <Route path="/signin" element={<SignInPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/create_password" element={<CreatePasswordPage />} />
      <Route path="/forgot_password" element={<ForgotPasswordPage />} />
      {/* auth */}

      {/* workSpace */}
      <Route path="/workspace/*">
        <Route
          path=":workSpaceId/*"
          element={
            <Layout>
              <WorkSpacePage />
            </Layout>
          }
        />
        {/* workSpace */}

        {/* env */}
        <Route
          path=":workSpaceId/environment"
          element={
            <Layout>
              <EnvironmentPage />
            </Layout>
          }
        />
        {/* env */}

        {/* history */}
        <Route
          path=":workSpaceId/history/*"
          element={
            <Layout>
              <HistoryPage />
            </Layout>
          }
        ></Route>
        {/* history */}

        {/* run */}
        <Route
          path=":workSpaceId/run*"
          element={
            <Layout>
              <RunPage />
            </Layout>
          }
        ></Route>
        {/* run */}
      </Route>

      <Route path="*" element={<h1>error</h1>} />
    </Routes>
  );
};

export default Navigator;
