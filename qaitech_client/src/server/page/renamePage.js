export const renamePage = async (pageId, name) => {
  const res = await fetch(
    `${process.env.REACT_APP_SERVER_URL}/api/pages/rename`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pageId, name }),
    }
  )
    .catch((err) => {
      return { error: "Something went wrong" };
    })
    .then((res) => {
      if (res.status >= 400) return res.json();

      if (!res || !res.ok) return { error: "Something went wrong" };

      return res.json();
    })
    .then((data) => {
      if (!data) return { error: "Something went wrong" };
      else return data;
    });

  return res;
};
