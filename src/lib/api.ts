// src/lib/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api', // your backend base URL
  withCredentials: true,                // if using cookies
});

export default api;
