import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "https://emt-be-dev.azurewebsites.net",
});

apiClient.interceptors.request.use((request) => {
  const accessToken = localStorage.getItem('accessToken');

  if (accessToken) {
    request.headers.Authorization = `Bearer ${accessToken}`;
    request.headers.AccessToken = accessToken;
  }
  return request;
});

export default apiClient;
