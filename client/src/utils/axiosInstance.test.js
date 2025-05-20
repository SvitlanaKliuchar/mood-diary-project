import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import axiosInstance, { setupInterceptors } from "../utils/axiosInstance";

describe("axiosInstance", () => {
  let mockAxios;
  const mockLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockAxios = new MockAdapter(axiosInstance);

    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});

    setupInterceptors({ logout: mockLogout });
  });

  afterEach(() => {
    mockAxios.restore();
    vi.restoreAllMocks();
  });

  it("creates instance with correct configuration", () => {
    expect(axiosInstance.defaults.baseURL).toBe("/api");
    expect(axiosInstance.defaults.withCredentials).toBe(true);
  });

  it("logs successful responses", async () => {
    mockAxios.onGet("/test").reply(200, { data: "success" });

    await axiosInstance.get("/test");

    expect(console.log).toHaveBeenCalledWith(
      "Response Interceptor (SUCCESS):",
      expect.stringContaining("URL => /test, STATUS => 200"),
    );
  });

  it("handles 404 errors with proper message", async () => {
    mockAxios.onGet("/not-found").reply(404);

    await expect(axiosInstance.get("/not-found")).rejects.toThrow(
      "Network error. Check connection.",
    );
    expect(console.warn).toHaveBeenCalledWith("resource not found.");
  });

  it("handles network errors", async () => {
    mockAxios.onGet("/network-error").networkErrorOnce();

    await expect(axiosInstance.get("/network-error")).rejects.toThrow(
      "Network error. Check connection.",
    );
    expect(console.error).toHaveBeenCalledWith(
      "no response object => possible network/CORS error:",
      expect.any(String),
    );
  });

  it("refreshes token on 401 unauthorized", async () => {
    mockAxios.onGet("/protected").replyOnce(401);
    mockAxios
      .onPost("/auth/refresh")
      .replyOnce(200, { message: "Token refreshed" });
    mockAxios.onGet("/protected").replyOnce(200, { data: "protected data" });

    const response = await axiosInstance.get("/protected");

    expect(response.data).toEqual({ data: "protected data" });
    expect(console.log).toHaveBeenCalledWith(
      "got a 401, attempt refresh =>",
      "/protected",
    );
  });

  it("handles unspecified error statuses", async () => {
    mockAxios.onGet("/server-error").reply(500, { error: "Server error" });

    await expect(axiosInstance.get("/server-error")).rejects.toThrow();

    expect(console.error).toHaveBeenCalledWith(
      "unhandled error =>",
      500,
      expect.objectContaining({ error: "Server error" }),
    );
  });
});
