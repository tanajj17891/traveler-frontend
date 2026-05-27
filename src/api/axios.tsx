import axios from "axios";

const api = axios.create({
  baseURL: "https://api.littletraveler.net",
});

export default api;