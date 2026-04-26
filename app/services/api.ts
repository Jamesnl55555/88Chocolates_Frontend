import { triggerLogout } from '@/utils/authEvents';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const api: AxiosInstance = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await AsyncStorage.getItem('userToken');

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

let isHandling401 = false;

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message;

    if (status === 401 && !isHandling401) {
      isHandling401 = true;

      if (message === 'Session expired due to inactivity.') {
        triggerLogout('expired');
      } else {
        triggerLogout('invalid');
      }

      await AsyncStorage.removeItem('userToken');

      setTimeout(() => {
        isHandling401 = false;
      }, 1000);
    }

    return Promise.reject(error);
  }
);

export default api;