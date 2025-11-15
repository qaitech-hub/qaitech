import { useState, useTransition } from "react";

function TestPage() {
  const [result, setResult] = useState(null);
  const [isPending, startTransition] = useTransition();

  const handleForm = (e) => {
    startTransition(async () => {
      const res = await fetch(e.get("api"), {
        method: e.get("method"),
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: e.get("url") }),
      });
      const data = await res.json();
      setResult(data);
    });
  };

  return (
    <div className="p-[10px] flex flex-col gap-[20px]">
      <div className="flex flex-col gap-[10px]">
        <h1 className="text-center font-bold text-[18px]">{"Постман))0)"}</h1>

        <form
          className="flex flex-col gap-[10px] max-w-[500px] w-full mx-auto border-[2px] border-black p-[12px] rounded-[20px]"
          action={handleForm}
        >
          <input
            name="api"
            placeholder="http://localhost:8080/api/route"
            defaultValue="http://localhost:8080/test/runtest"
            className="border-black border-[2px] rounded-[8px] p-[6px]"
          />

          <select
            name="method"
            className="border-black border-[2px] rounded-[8px] p-[6px]"
          >
            {["POST", "GET"].map((option, index) => {
              return <option key={index}>{option}</option>;
            })}
          </select>

          <input
            name="url"
            defaultValue="https://google.com"
            className="border-black border-[2px] rounded-[8px] p-[6px]"
          />

          <button
            className="border-black border-[2px] rounded-[8px] p-[6px] bg-black text-white"
            disabled={isPending}
          >
            {isPending ? "н а ч а л о с ь" : "Отправить"}
          </button>
        </form>
      </div>

      <div className="flex flex-col gap-[10px]">
        <h1 className="text-center font-bold text-[18px]">{"Ответ))0)"}</h1>
        <div className="flex flex-col gap-[10px] max-w-[500px] w-full mx-auto border-[2px] border-black p-[12px] rounded-[20px]">
          <p className="text-[#3d3d3d] font-medium">
            {!result ? "Тут будет ответ..." : JSON.stringify(result)}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-[10px]">
        <h1 className="text-center font-bold text-[18px]">{"Картинка))0)"}</h1>
        <div className="flex flex-col gap-[10px] max-w-[500px] w-full mx-auto border-[2px] border-black p-[12px] rounded-[20px]">
          <p className="text-[#3d3d3d] font-medium">
            {!result ? (
              "Тут будет ответ..."
            ) : (
              <img
                src={"data:image/png;base64," + result?.screenshot}
                alt="screenshot"
              />
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

export default TestPage;
