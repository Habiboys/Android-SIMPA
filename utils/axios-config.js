import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';

const axiosInstance = axios.create({
  baseURL: API_URL,
  // timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor untuk menambahkan token
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      } else {
        console.warn('Access token not found in storage');
      }
      return config;
    } catch (error) {
      console.error('Error retrieving access token:', error);
      return Promise.reject(error);
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor untuk handle refresh token
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle timeout
    if (error.code === 'ECONNABORTED') {
      console.error('Request timed out');
      Alert.alert('Error', 'Koneksi timeout. Silakan coba lagi.');
      return Promise.reject(error);
    }

    // Handle error 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        if (!refreshToken) {
          console.error('Refresh token not found in storage');
          navigation.replace('Login'); // Redirect to login
          return Promise.reject(new Error('Refresh token not found'));
        }

        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken: refreshToken,
        });

        const { accessToken } = response.data;

        // Simpan token baru
        await AsyncStorage.setItem('accessToken', accessToken);

        // Update header dan ulangi request
        axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error('Refresh token failed:', refreshError);
        navigation.replace('Login'); // Redirect to login
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;