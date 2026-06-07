import axios from "axios";

const api = axios.create({
  baseURL: "https://banking-system-production-c33a.up.railway.app"
});

export default api;import axios from "axios";

const api = axios.create({
  baseURL: "https://banking-system-production-c33a.up.railway.app/api"
});

export default api;