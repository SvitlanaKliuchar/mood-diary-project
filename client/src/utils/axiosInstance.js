import axios from "axios";

const axiosInstance = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  withCredentials: true, // send cookies
});

// interceptors setup
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

  axiosInstance.interceptors.request.use(
    async (config) => {
      const method = config.method?.toLowerCase();
      if (["post", "put", "patch", "delete"].includes(method)) {
        try {
          const { data } = await axiosInstance.get("/auth/csrf-token");
          config.headers["X-CSRF-Token"] = data.csrfToken;
        } catch (err) {
          console.error("Failed to fetch CSRF token:", err.message);
        }
      }
      return config;
    },
    (error) => Promise.reject(error),
  );
  axiosInstance.interceptors.response.use(
    (response) => {
      console.log(
        "Response Interceptor (SUCCESS):",
        `URL => ${response.config.url}, STATUS => ${response.status}`,
      );
      return response;
    },

    async (error) => {
      console.log("Response Interceptor (ERROR) triggered.");

      if (!error.response) {
        console.error(
          "no response object => possible network/CORS error:",
          error.message,
        );
        return Promise.reject(new Error("Network error. Check connection."));
      }

      const originalRequest = error.config;
      const status = error.response.status;
      console.warn(`http status => ${status} | url => ${originalRequest.url}`);

      if (status === 404) {
        return Promise.reject(new Error("Resource not found"));
      }

      if (status === 401 && !originalRequest._retry) {
        console.log("got a 401, attempt refresh =>", originalRequest.url);

        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(() => axiosInstance(originalRequest))
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const { data } = await axiosInstance.post("/auth/refresh");
          processQueue(null);
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          logout();
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    },
  );
};

export default axiosInstance;
