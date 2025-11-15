// import { useLocation } from "react-router-dom";
import { createContext, useEffect, useState } from "react";

import storage from "../storage/localStorage";

export const PagesContext = createContext();

const PagesContexWrap = ({ children }) => {
  // const { pathname } = useLocation();

  const [data, setData] = useState(null);
  const [test, setTest] = useState(null);
  const [selectedPage, setSelectedPage] = useState(
    storage.get("selectedPage") ? JSON.parse(storage.get("selectedPage")) : null
  );

  // дергать эту хуню чтобы апдейтить данные сайдбара
  const [updateData, setUpdateData] = useState(false);

  useEffect(() => {
    storage.set("selectedPage", JSON.stringify(selectedPage));
  }, [selectedPage, setSelectedPage]);

  // useEffect(() => {
  //   // setData(null);
  // }, [pathname]);

  return (
    <PagesContext.Provider
      value={{
        data,
        setData,
        selectedPage,
        setSelectedPage,
        test,
        setTest,
        updateData,
        setUpdateData,
      }}
    >
      {children}
    </PagesContext.Provider>
  );
};

export default PagesContexWrap;
