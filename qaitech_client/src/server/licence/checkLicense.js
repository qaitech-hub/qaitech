// Асинхронные функции для шифрования/дешифрования
const encryptKey = async (key, secret) => {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "AES-GCM" },
    false,
    ["encrypt"]
  );

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encodedKey = encoder.encode(key);

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    cryptoKey,
    encodedKey
  );

  return {
    iv: Array.from(iv).join(","),
    data: Array.from(new Uint8Array(encrypted)).join(","),
  };
};

export const checkLicense = async (key) => {
  const secret = process.env.REACT_APP_CRYPT_LICENSE_SECRET;
  const licenseKey = key;

  const encrypted = await encryptKey(licenseKey, secret);

  const res = await fetch(
    `${process.env.REACT_APP_SERVER_URL}/api/license/check`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ key: encrypted }),
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
