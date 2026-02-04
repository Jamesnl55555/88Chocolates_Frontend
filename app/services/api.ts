import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

// 1. Define the base configuration
const api: AxiosInstance = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// 2. Request Interceptor (e.g., attach Bearer token)
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Logic to retrieve your token from local storage
    const token = await AsyncStorage.getItem('userToken');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 3. Response Interceptor (e.g., global error handling)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle "Unauthorized" (e.g., redirect to login or refresh token)
    }
    return Promise.reject(error);
  }
);

export default api;
