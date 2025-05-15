import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

const api: AxiosInstance = axios.create({
  // baseURL: 'http://localhost:8000', 
  baseURL: 'https://accessback.onrender.com', 
});

// Intercepteur pour injecter le token JWT
// api.interceptors.request.use((config: AxiosRequestConfig) => {
//   const token = localStorage.getItem('token');
//   if (token) {
//     config.headers = {
//       ...config.headers,
//       Authorization: `Bearer ${token}`,
//     };
//   }
//   return config;
// });

export default api;