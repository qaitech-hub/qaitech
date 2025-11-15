import React from "react";

import Footer from "../components/Footer";
import Header from "../components/Header";
import SideBar from "../components/SideBar";

import ModalHandlerWrap from "../components/Modals/ModalHandlerWrap";
import PagesContexWrap from "./PagesContex";

export const Layout = ({ children }) => {
  return (
    <PagesContexWrap>
      <ModalHandlerWrap>
        <div className="h-screen grid grid-rows-[40px_calc(100%-65px)_25px] overflow-hidden">
          <Header />

          <div className="w-full h-full grid grid-cols-[56px_calc(100%-56px)]">
            <SideBar />

            {children}
          </div>
          <Footer />
        </div>
      </ModalHandlerWrap>
    </PagesContexWrap>
  );
};
