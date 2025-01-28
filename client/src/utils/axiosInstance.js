import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

export const setupInterceptors = (store) => {
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // check if the error is 401 and the request hasnt been retried yet
      // exclude the /auth/refresh endpoint to prevent infinite loops
      if (
        error.response &&
        error.response.status === 401 &&
        !originalRequest._retry &&
        originalRequest.url !== '/auth/refresh'
      ) {
        originalRequest._retry = true; //mark the request as retried
        try {
          //attempt to refresh the access token
          const refreshResponse = await axiosInstance.post('/auth/refresh');

          if (refreshResponse.status === 200) {
            //retry the original request with the new token
            return axiosInstance(originalRequest);
          }
        } catch (refreshError) {
          //if refresh fails log the user out
          store.logout();
          return Promise.reject(refreshError);
        }
      }

      //reject the promise for other errors
      return Promise.reject(error);
    }
  );
};

export default axiosInstance;
