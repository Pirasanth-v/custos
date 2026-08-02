import axios from "axios";
import qs from "qs";
import { toast } from "./toast";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  paramsSerializer: (params) => qs.stringify(params, { arrayFormat: "repeat" }),
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 429) {
      toast.error("Too many requests. Please try again later.", {
        id: "rate-limit",
      });
    }
    return Promise.reject(error);
  },
);

export default api;
