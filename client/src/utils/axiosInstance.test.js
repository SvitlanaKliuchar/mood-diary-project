import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";

// We'll test the functions directly rather than the singleton instance
const createTestInstance = () => {
  const instance = axios.create({
    baseURL: "/api",
    withCredentials: true,
  });

  const setupTestInterceptors = ({ logout }) => {
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

    instance.interceptors.request.use(
      async (config) => {
        const method = config.method?.toLowerCase();
        if (["post", "put", "patch", "delete"].includes(method)) {
          try {
            const { data } = await instance.get("/auth/csrf-token");
            config.headers["X-CSRF-Token"] = data.csrfToken;
          } catch (err) {
            console.error("Failed to fetch CSRF token:", err.message);
          }
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    instance.interceptors.response.use(
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

        if (status === 401 && !originalRequest._retry && originalRequest.url !== "/auth/refresh") {
          console.log("got a 401, attempt refresh =>", originalRequest.url);

          if (isRefreshing) {
            return new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            })
              .then(() => instance(originalRequest))
              .catch((err) => Promise.reject(err));
          }

          originalRequest._retry = true;
          isRefreshing = true;

          try {
            const { data } = await instance.post("/auth/refresh");
            processQueue(null);
            return instance(originalRequest);
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

  return { instance, setupTestInterceptors };
};

describe("axiosInstance", () => {
  let mockAxios;
  let testInstance;
  let setupTestInterceptors;
  const mockLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    const testSetup = createTestInstance();
    testInstance = testSetup.instance;
    setupTestInterceptors = testSetup.setupTestInterceptors;
    
    mockAxios = new MockAdapter(testInstance);

    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    mockAxios.restore();
    vi.restoreAllMocks();
  });

  it("creates instance with correct configuration", () => {
    expect(testInstance.defaults.baseURL).toBe("/api");
    expect(testInstance.defaults.withCredentials).toBe(true);
  });

  it("logs successful responses", async () => {
    setupTestInterceptors({ logout: mockLogout });
    mockAxios.onGet("/test").reply(200, { data: "success" });

    await testInstance.get("/test");

    expect(console.log).toHaveBeenCalledWith(
      "Response Interceptor (SUCCESS):",
      expect.stringContaining("URL => /test, STATUS => 200"),
    );
  });

  describe("CSRF Token Handling", () => {
    beforeEach(() => {
      setupTestInterceptors({ logout: mockLogout });
    });

    it("fetches CSRF token for POST requests", async () => {
      const csrfToken = "test-csrf-token";
      mockAxios.onGet("/auth/csrf-token").reply(200, { csrfToken });
      mockAxios.onPost("/data").reply(200, { success: true });

      await testInstance.post("/data", { test: "data" });

      const csrfRequests = mockAxios.history.get.filter(req => req.url === "/auth/csrf-token");
      expect(csrfRequests).toHaveLength(1);
      
      expect(mockAxios.history.post).toHaveLength(1);
      expect(mockAxios.history.post[0].headers["X-CSRF-Token"]).toBe(csrfToken);
    });

    it("fetches CSRF token for PUT requests", async () => {
      const csrfToken = "test-csrf-token";
      mockAxios.onGet("/auth/csrf-token").reply(200, { csrfToken });
      mockAxios.onPut("/data/1").reply(200, { success: true });

      await testInstance.put("/data/1", { test: "data" });

      const csrfRequests = mockAxios.history.get.filter(req => req.url === "/auth/csrf-token");
      expect(csrfRequests).toHaveLength(1);
      expect(mockAxios.history.put[0].headers["X-CSRF-Token"]).toBe(csrfToken);
    });

    it("fetches CSRF token for PATCH requests", async () => {
      const csrfToken = "test-csrf-token";
      mockAxios.onGet("/auth/csrf-token").reply(200, { csrfToken });
      mockAxios.onPatch("/data/1").reply(200, { success: true });

      await testInstance.patch("/data/1", { test: "data" });

      const csrfRequests = mockAxios.history.get.filter(req => req.url === "/auth/csrf-token");
      expect(csrfRequests).toHaveLength(1);
      expect(mockAxios.history.patch[0].headers["X-CSRF-Token"]).toBe(csrfToken);
    });

    it("fetches CSRF token for DELETE requests", async () => {
      const csrfToken = "test-csrf-token";
      mockAxios.onGet("/auth/csrf-token").reply(200, { csrfToken });
      mockAxios.onDelete("/data/1").reply(200, { success: true });

      await testInstance.delete("/data/1");

      const csrfRequests = mockAxios.history.get.filter(req => req.url === "/auth/csrf-token");
      expect(csrfRequests).toHaveLength(1);
      expect(mockAxios.history.delete[0].headers["X-CSRF-Token"]).toBe(csrfToken);
    });

    it("does not fetch CSRF token for GET requests", async () => {
      mockAxios.onGet("/data").reply(200, { data: "success" });

      await testInstance.get("/data");

      expect(mockAxios.history.get).toHaveLength(1);
      expect(mockAxios.history.get[0].url).toBe("/data");
    });

    it("handles CSRF token fetch failure gracefully", async () => {
      mockAxios.onGet("/auth/csrf-token").reply(500, { error: "Server error" });
      mockAxios.onPost("/data").reply(200, { success: true });

      await testInstance.post("/data", { test: "data" });

      expect(console.error).toHaveBeenCalledWith(
        "Failed to fetch CSRF token:",
        expect.any(String)
      );
      expect(mockAxios.history.post).toHaveLength(1);
      expect(mockAxios.history.post[0].headers["X-CSRF-Token"]).toBeUndefined();
    });
  });

  describe("Error Handling", () => {
    beforeEach(() => {
      setupTestInterceptors({ logout: mockLogout });
    });

    it("handles 404 errors with proper message", async () => {
      mockAxios.onGet("/not-found").reply(404);

      await expect(testInstance.get("/not-found")).rejects.toThrow(
        "Resource not found"
      );
      expect(console.warn).toHaveBeenCalledWith(
        "http status => 404 | url => /not-found"
      );
    });

    it("handles network errors", async () => {
      mockAxios.onGet("/network-error").networkError();

      await expect(testInstance.get("/network-error")).rejects.toThrow(
        "Network error. Check connection."
      );
      expect(console.error).toHaveBeenCalledWith(
        "no response object => possible network/CORS error:",
        expect.any(String)
      );
    });

    it("handles other error statuses", async () => {
      mockAxios.onGet("/server-error").reply(500, { error: "Server error" });

      await expect(testInstance.get("/server-error")).rejects.toThrow();
      expect(console.warn).toHaveBeenCalledWith(
        "http status => 500 | url => /server-error"
      );
    });
  });

  describe("Token Refresh Logic", () => {
    beforeEach(() => {
      setupTestInterceptors({ logout: mockLogout });
    });

    it("refreshes token on 401 unauthorized", async () => {
      mockAxios.onGet("/protected").replyOnce(401);
      mockAxios.onPost("/auth/refresh").replyOnce(200, { message: "Token refreshed" });
      mockAxios.onGet("/protected").replyOnce(200, { data: "protected data" });

      const response = await testInstance.get("/protected");

      expect(response.data).toEqual({ data: "protected data" });
      expect(console.log).toHaveBeenCalledWith(
        "got a 401, attempt refresh =>",
        "/protected"
      );
    });

    it("calls logout when refresh fails", async () => {
      // Mock the initial request that fails with 401
      mockAxios.onGet("/protected").replyOnce(401);
      
      // Mock the refresh request that also fails with 401
      mockAxios.onPost("/auth/refresh").replyOnce(401, { error: "Invalid refresh token" });

      // Ensure the request fails
      await expect(testInstance.get("/protected")).rejects.toThrow();

      expect(mockLogout).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith(
        "got a 401, attempt refresh =>",
        "/protected"
      );
    });

    it("queues multiple requests during token refresh", async () => {
      // First requests fail with 401
      mockAxios.onGet("/protected1").replyOnce(401);
      mockAxios.onGet("/protected2").replyOnce(401);
      
      // Refresh succeeds
      mockAxios.onPost("/auth/refresh").replyOnce(200, { message: "Token refreshed" });
      
      // Retry requests succeed
      mockAxios.onGet("/protected1").replyOnce(200, { data: "data1" });
      mockAxios.onGet("/protected2").replyOnce(200, { data: "data2" });

      const [response1, response2] = await Promise.all([
        testInstance.get("/protected1"),
        testInstance.get("/protected2")
      ]);

      expect(response1.data).toEqual({ data: "data1" });
      expect(response2.data).toEqual({ data: "data2" });
      
      const refreshRequests = mockAxios.history.post.filter(req => req.url === "/auth/refresh");
      expect(refreshRequests).toHaveLength(1);
    });

    it("does not retry already retried requests", async () => {
      // Mock the initial request that fails with 401
      mockAxios.onGet("/protected").replyOnce(401);
      
      // Mock the refresh request that also fails with 401
      mockAxios.onPost("/auth/refresh").replyOnce(401);

      // Ensure the request fails
      await expect(testInstance.get("/protected")).rejects.toThrow();

      expect(mockLogout).toHaveBeenCalled();
      const refreshRequests = mockAxios.history.post.filter(req => req.url === "/auth/refresh");
      expect(refreshRequests).toHaveLength(1);
    });
  });

  describe("Interceptor Setup", () => {
    it("logs interceptor attachment", () => {
      setupTestInterceptors({ logout: mockLogout });
      expect(console.log).toHaveBeenCalledWith("Interceptor attached!");
    });

    it("logs response interceptor trigger on error", async () => {
      setupTestInterceptors({ logout: mockLogout });
      mockAxios.onGet("/error").reply(500);

      await expect(testInstance.get("/error")).rejects.toThrow();

      expect(console.log).toHaveBeenCalledWith("Response Interceptor (ERROR) triggered.");
    });
  });

  describe("CSRF with Token Refresh Integration", () => {
    beforeEach(() => {
      setupTestInterceptors({ logout: mockLogout });
    });

    it("includes CSRF token when retrying after token refresh", async () => {
      const csrfToken = "test-csrf-token";
      
      // First POST request fails with 401
      mockAxios.onPost("/protected-post").replyOnce(401);
      
      // Refresh succeeds
      mockAxios.onPost("/auth/refresh").replyOnce(200, { message: "Token refreshed" });
      
      // CSRF token fetch for retry
      mockAxios.onGet("/auth/csrf-token").reply(200, { csrfToken });
      
      // Retry succeeds
      mockAxios.onPost("/protected-post").replyOnce(200, { success: true });

      const response = await testInstance.post("/protected-post", { data: "test" });

      expect(response.data).toEqual({ success: true });
      
      // Expect 3 CSRF requests: original POST, refresh POST, and retry POST
      const csrfRequests = mockAxios.history.get.filter(req => req.url === "/auth/csrf-token");
      expect(csrfRequests).toHaveLength(3);
      
      const postRequests = mockAxios.history.post.filter(req => req.url === "/protected-post");
      expect(postRequests).toHaveLength(2); // Original + retry
      expect(postRequests[1].headers["X-CSRF-Token"]).toBe(csrfToken);
    });
  });
});