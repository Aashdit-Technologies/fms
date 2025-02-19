// api.js
import axios from "axios";
import useAuthStore from "../store/Store";



const api = axios.create({
  //  baseURL: "http://192.168.3.170:2020/file-management/api/",
  // baseURL: "http://192.168.3.180:2020/file-management/api/",
  // baseURL: "http://192.168.3.165:2020/file-management/api/",
  // baseURL: "http://142.93.210.247:2020/file-management/api/",
  baseURL: "http://139.59.12.212:2020/file-management/api/",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials:true,
});

api.interceptors.request.use(
    
  (config) => {
    const token = useAuthStore.getState().token || sessionStorage.getItem("token");
    
    if (token) {
        
      config.headers.Authorization = `Bearer ${token}`;
      console.log("Authorization Token in Request:", token);
    } else {
      console.warn("No Authorization token found!");
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearToken();
      sessionStorage.removeItem("token"); 
      window.location.href = "/login"; 
    }
    return Promise.reject(error);
  }
);

export default api;
