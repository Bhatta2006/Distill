import axios from "axios";
import { useSettingsStore } from "../store/useSettingsStore";

const client = axios.create({
  baseURL: "/api",
  timeout: 60_000,
});

client.interceptors.request.use((config) => {
  const key = useSettingsStore.getState().apiKey;
  if (key) config.headers["X-API-Key"] = key;
  return config;
});

export default client;
