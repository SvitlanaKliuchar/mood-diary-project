import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

export const setupInterceptors = ({ logout }) => {
  console.log("Interceptor attached!");

  let isRefreshing = false;
  let failedQueue = [];

  const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
      if (error) {
        console.log("processQueue rejecting queued request.", error);
        prom.reject(error);
      } else {
        console.log("processQueue resolving queued request.");
        prom.resolve();
      }
    });
    failedQueue = [];
  };

  axiosInstance.interceptors.response.use(
    // handle successful responses
    (response) => {
      console.log(
        "Response Interceptor (SUCCESS):",
        `URL => ${response.config.url}, STATUS => ${response.status}`
      );
      return response;
    },

    // handle error responses
    async (error) => {
      console.log("Response Interceptor (ERROR) triggered.");

      if (!error.response) {
        console.error("no response object => possible network/CORS error:", error.message);
        return Promise.reject(new Error("Network error. Check connection."));
      }

      const originalRequest = error.config;
      const status = error.response.status;
      console.warn(`http status => ${status} | url => ${originalRequest.url}`);

      if (status === 404) {
        console.warn("resource not found.");
        return Promise.reject(new Error("Resource not found"));
      }

      // handle unauthorized errors
      if (status === 401 && !originalRequest._retry) {
        console.log("got a 401, attempt refresh =>", originalRequest.url);

        if (isRefreshing) {
          console.log("already refreshing. queueing request...");
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(() => {
              console.log("retrying original request after refresh =>", originalRequest.url);
              return axiosInstance(originalRequest);
            })
            .catch((err) => {
              console.error("failed to retry queued request:", err);
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          console.log("calling /auth/refresh now...");
          const { data } = await axiosInstance.post("/auth/refresh");

          console.log("refresh response =>", data?.message || "no message in response.");

          console.log("clearing and processing any queued requests...");
          processQueue(null);

          console.log("retrying the original request =>", originalRequest.url);
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          console.error("refresh token request failed =>", refreshError);

          processQueue(refreshError, null);

          console.warn("logging out user due to refresh failure...");
          logout();
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      console.error("unhandled error =>", status, error.response.data || error.message);
      return Promise.reject(error);
    }
  );
};

export default axiosInstance;
