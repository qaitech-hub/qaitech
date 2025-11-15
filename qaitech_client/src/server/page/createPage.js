import axios from "axios";

export const createPage = async (formData) => {
  const { title, url, viewport, projectId, isAi, file } = formData;

  // Создаем объект FormData
  const form = new FormData();
  form.append("title", title);
  form.append("url", url);
  form.append("viewport", JSON.stringify(viewport)); // Сериализуем объект viewport
  form.append("projectId", projectId);
  form.append("isAi", isAi);

  // Добавляем файл
  if (file && file.length > 0) {
    form.append("file", file[0]); // Предполагается, что file — массив с одним элементом
  }

  const res = await axios
    .post(`${process.env.REACT_APP_SERVER_URL}/api/pages/`, form, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      withCredentials: true,
    })
    .catch((err) => {
      // Обработка ошибок сети/запроса
      return { error: "Something went wrong" };
    })
    .then((response) => {
      // Обработка HTTP ошибок (status >= 400)
      if (response?.status >= 400) {
        return response.data || { error: "Request failed" };
      }

      if (!response || !response.data) {
        return { error: "Something went wrong" };
      }

      return response.data;
    })
    .then((data) => {
      // Финальная проверка данных
      if (!data) return { error: "Something went wrong" };
      return data;
    });

  return res;
};
