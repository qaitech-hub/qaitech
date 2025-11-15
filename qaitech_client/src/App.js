import { Toaster } from "react-hot-toast";
import { useEffect } from "react";

import AccountContextWrap from "./layouts/AccountContext";
import Navigator from "./pages/Navigator";

function App() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const METRIKA_ID = 105327543; // Обновлённый ID
    const SCRIPT_URL = `https://mc.yandex.ru/metrika/tag.js?id=${METRIKA_ID}`;

    // Проверяем, не загружен ли уже скрипт с таким src
    const existingScript = Array.from(document.scripts).find(
      (script) => script.src === SCRIPT_URL
    );
    if (existingScript) return;

    // Создаём скрипт инициализации
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.innerHTML = `
      (function(m,e,t,r,i,k,a){
        m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
        m[i].l=1*new Date();
        for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
        k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
      })(window, document, 'script', '${SCRIPT_URL}', 'ym');

      // Инициализируем сразу после определения ym (на случай, если скрипт уже отработал)
      if (typeof ym === 'function') {
        ym(${METRIKA_ID}, 'init', {
          ssr: true,
          webvisor: true,
          clickmap: true,
          ecommerce: "dataLayer",
          accurateTrackBounce: true,
          trackLinks: true
        });
      }
    `;

    document.head.appendChild(script);

    // Также добавим noscript fallback
    const noscript = document.createElement("noscript");
    const img = document.createElement("img");
    img.src = `https://mc.yandex.ru/watch/${METRIKA_ID}`;
    img.alt = "";
    img.style.cssText = "position:absolute; left:-9999px;";
    noscript.appendChild(document.createElement("div")).appendChild(img);
    document.body.appendChild(noscript);

    // Очистка при размонтировании (опционально, но рекомендуется — не удалять скрипт, но можно убрать noscript)
    return () => {
      if (noscript.parentNode) {
        noscript.parentNode.removeChild(noscript);
      }
    };
  }, []);

  return (
    <AccountContextWrap>
      <Navigator />

      <Toaster
        toastOptions={{
          className: "",
          style: {
            border: "1px solid #9BEAB1",
            background: "#020413",
            color: "#fff",
          },
        }}
      />
    </AccountContextWrap>
  );
}

export default App;
