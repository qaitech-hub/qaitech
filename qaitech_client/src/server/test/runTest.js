export const runTest = async (testIds = null, browser = "Chrome") => {
  const res = await fetch(
    `${process.env.REACT_APP_SERVER_URL}/api/tests/run-tests`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ testIds, browser }),
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
