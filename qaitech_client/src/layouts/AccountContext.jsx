import { useLocation } from "react-router-dom";
import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";

export const AccountContext = createContext();

const AccountContextWrap = ({ children }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [user, setUser] = useState({ loggedIn: null, userId: null });

  // console.log(user);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_SERVER_URL}/api/auth/login`, {
      credentials: "include",
    })
      .catch((err) => {
        setUser({ loggedIn: false });
        return;
      })
      .then((r) => {
        if (!r || !r.ok || r.status >= 400) {
          setUser({ loggedIn: false });
          return;
        }
        return r.json();
      })
      .then((data) => {
        if (!data) {
          setUser({ loggedIn: false });
          return;
        }
        setUser({ ...data });
      });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isOnAuth =
    pathname === "/signin" ||
    pathname === "/signup" ||
    pathname === "/forgot_password";

  const isLoggenIn = user.loggedIn !== null && user.loggedIn !== false;

  useEffect(() => {
    // Если отключена авторизация, сразу редиректим на /home или /workspace
    if (process.env.REACT_APP_DISABLE_AUTH === "true") {
      if (
        pathname.startsWith("/signin") ||
        pathname.startsWith("/signup") ||
        pathname.startsWith("/forgot_password") ||
        pathname === "/"
      ) {
        navigate("/home");
      }
      return;
    }
    if (pathname === "/workspace" || pathname === "/workspace/")
      navigate("/home");

    if (user?.id?.includes("noPassword") && pathname !== "/create_password")
      navigate("/create_password");
    if (!user?.id?.includes("noPassword") && pathname === "/create_password")
      navigate("/home");
    if (isOnAuth && isLoggenIn && !user?.id?.includes("noPassword"))
      navigate("/home");
    if (isLoggenIn && user?.id?.includes("noPassword"))
      navigate("/create_password");
    if (!isOnAuth && user.loggedIn === false) navigate("/signin");
    if (pathname === "/") navigate("/home");
  }, [user, pathname]);

  return (
    <AccountContext.Provider value={{ user, setUser }}>
      {children}
    </AccountContext.Provider>
  );
};

export default AccountContextWrap;
