export const logout = async () => {
  // в values получаем {email, password}
  const res = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/logout`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .catch((err) => {
      return { error: "Something went wrong" };
    })
    .then((res) => {
      if (res.status >= 400) return { success: true };

      if (!res || !res.ok) return { error: "Something went wrong" };

      return { success: true };
    })
    .then((data) => {
      if (!data) return { error: "Something went wrong" };
      else return { success: true };
    });

  return res;
};
