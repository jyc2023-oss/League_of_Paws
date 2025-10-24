import axios from 'axios';

export const apiClient = axios.create({
  baseURL: 'https://api.your-domain.example/v1',
  timeout: 20000
});

apiClient.interceptors.request.use(config => {
  // TODO: 注入鉴权 token
  return config;
});

apiClient.interceptors.response.use(
  response => response,
  error => {
    // TODO: 集中处理错误上报/提示
    return Promise.reject(error);
  }
);
