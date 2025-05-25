import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  render,
  screen,
  waitFor,
  act,
  fireEvent,
} from "@testing-library/react";
import React, { useState } from "react";
import AuthProvider, { AuthContext } from "./AuthContext";
import axiosInstance from "../utils/axiosInstance.js";
import MockAdapter from "axios-mock-adapter";

// initialize Axios Mock Adapter with the custom axios instance
const mock = new MockAdapter(axiosInstance);

function TestConsumer() {
  const { user, loading, login, register, logout } =
    React.useContext(AuthContext);
  const [entriesData, setEntriesData] = useState(null);
  const [entriesError, setEntriesError] = useState(null);

  const fetchEntries = async () => {
    try {
      const response = await axiosInstance.get("/entries");
      setEntriesData(response.data);
      setEntriesError(null);
    } catch (error) {
      setEntriesError(error.response?.data?.error || "Error fetching data");
      setEntriesData(null);
    }
  };

  return (
    <div>
      {loading ? (
        <p data-testid="loading-state">Loading...</p>
      ) : user ? (
        <p data-testid="user-display">{user.username}</p>
      ) : (
        <p data-testid="user-display">No user</p>
      )}

      <button
        onClick={() => login({ identifier: "myuser", password: "mypass" })}
      >
        Test Login
      </button>

      <button
        onClick={() =>
          register({
            username: "NewUser",
            email: "new@email.com",
            password: "pass",
          })
        }
      >
        Test Register
      </button>

      <button onClick={() => logout()}>Test Logout</button>

      <button onClick={fetchEntries}>Fetch Entries</button>

      {entriesData && (
        <p data-testid="entries-data">{JSON.stringify(entriesData)}</p>
      )}

      {entriesError && <p data-testid="entries-error">{entriesError}</p>}
    </div>
  );
}

describe("AuthProvider", () => {
  beforeEach(() => {
    mock.reset();
    // Mock CSRF token endpoint for all POST requests
    mock.onGet("/auth/csrf-token").reply(200, { csrfToken: "test-csrf-token" });
  });

  it("loads user on init via /auth/me", async () => {
    mock.onGet("/auth/me").reply(200, {
      user: { id: 1, username: "FetchedUser", email: "fetched@example.com" },
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    expect(screen.getByTestId("loading-state")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByTestId("loading-state")).not.toBeInTheDocument();
    });

    expect(screen.getByTestId("user-display")).toHaveTextContent("FetchedUser");
    expect(mock.history.get.filter((r) => r.url === "/auth/me").length).toBe(1);
  });

  it("handles unauthorized /auth/me by not setting a user", async () => {
    mock.onGet("/auth/me").reply(401);

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.queryByTestId("loading-state")).not.toBeInTheDocument();
    });

    expect(screen.getByTestId("user-display")).toHaveTextContent("No user");
  });

  it("successfully logs in a user and updates context", async () => {
    mock.onGet("/auth/me").reply(401);
    mock.onPost("/auth/login").reply(200, {
      user: { id: 10, username: "LoggedIn", email: "logged@example.com" },
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.queryByTestId("loading-state")).not.toBeInTheDocument();
    });

    expect(screen.getByTestId("user-display")).toHaveTextContent("No user");

    await act(async () => {
      fireEvent.click(screen.getByText("Test Login"));
    });

    expect(screen.getByTestId("user-display")).toHaveTextContent("LoggedIn");
  });

  it("prevents login when server returns an error", async () => {
    mock.onGet("/auth/me").reply(401);
    mock.onPost("/auth/login").reply(400, { error: "Invalid credentials" });

    let contextRef;
    function ConsumerWithRef() {
      contextRef = React.useContext(AuthContext);
      return <div>Consumer</div>;
    }

    render(
      <AuthProvider>
        <ConsumerWithRef />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(contextRef.loading).toBe(false);
    });

    let result;
    await act(async () => {
      result = await contextRef.login({ identifier: "bad", password: "wrong" });
    });

    expect(result).toBe(false);
    expect(contextRef.user).toBeNull();
  });

  it("successfully registers a new user and updates context", async () => {
    mock.onGet("/auth/me").reply(401);
    mock.onPost("/auth/register").reply(201, {
      user: { id: 99, username: "NewUser", email: "new@example.com" },
    });

    let contextRef;
    function ConsumerWithRef() {
      contextRef = React.useContext(AuthContext);
      return <div>Consumer</div>;
    }

    render(
      <AuthProvider>
        <ConsumerWithRef />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(contextRef.loading).toBe(false);
    });

    let regResult;
    await act(async () => {
      regResult = await contextRef.register({
        username: "NewUser",
        email: "new@example.com",
        password: "pass",
      });
    });

    expect(regResult).toBe(true);
    expect(contextRef.user).toEqual({
      id: 99,
      username: "NewUser",
      email: "new@example.com",
    });
  });

  it("prevents registration when server returns an error", async () => {
    mock.onGet("/auth/me").reply(401);
    mock.onPost("/auth/register").reply(400, { error: "Email already taken" });

    let contextRef;
    function ConsumerWithRef() {
      contextRef = React.useContext(AuthContext);
      return <div>Consumer</div>;
    }

    render(
      <AuthProvider>
        <ConsumerWithRef />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(contextRef.loading).toBe(false);
    });

    let regResult;
    await act(async () => {
      regResult = await contextRef.register({
        username: "FailUser",
        email: "fail@example.com",
        password: "pass",
      });
    });

    expect(regResult).toBe(false);
    expect(contextRef.user).toBeNull();
  });

  it("successfully logs out a user and clears context", async () => {
    mock
      .onGet("/auth/me")
      .reply(200, { user: { id: 123, username: "PreUser" } });
    mock.onPost("/auth/logout").reply(200, { message: "Logged out" });

    let contextRef;
    function ConsumerWithRef() {
      contextRef = React.useContext(AuthContext);
      return <div>Consumer</div>;
    }

    render(
      <AuthProvider>
        <ConsumerWithRef />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(contextRef.loading).toBe(false);
    });

    expect(contextRef.user.username).toBe("PreUser");

    let logoutResult;
    await act(async () => {
      logoutResult = await contextRef.logout();
    });

    expect(logoutResult).toBe(true);
    expect(contextRef.user).toBeNull();
  });

  it("prevents logout and retains user state when server returns an error", async () => {
    mock
      .onGet("/auth/me")
      .reply(200, { user: { id: 500, username: "FailLogout" } });
    mock.onPost("/auth/logout").reply(500, { message: "Server died" });

    let contextRef;
    function ConsumerWithRef() {
      contextRef = React.useContext(AuthContext);
      return <div>Consumer</div>;
    }

    render(
      <AuthProvider>
        <ConsumerWithRef />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(contextRef.loading).toBe(false);
    });

    expect(contextRef.user.username).toBe("FailLogout");

    let logoutResult;
    await act(async () => {
      logoutResult = await contextRef.logout();
    });

    expect(logoutResult).toBe(false);
    expect(contextRef.user.username).toBe("FailLogout");
  });

  it("automatically refreshes access token upon 401 and retries the original request", async () => {
    mock
      .onGet("/auth/me")
      .reply(200, { user: { id: 1, username: "CachedUser" } });

    // Test token refresh with /entries endpoint (more realistic for mood diary app)
    mock.onGet("/entries").replyOnce(401);
    mock
      .onPost("/auth/refresh")
      .replyOnce(200, { message: "Access token refreshed" });
    mock.onGet("/entries").replyOnce(200, {
      entries: [{ id: 1, mood: "happy", content: "Great day!" }],
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("user-display")).toHaveTextContent(
        "CachedUser",
      );
    });

    await act(async () => {
      fireEvent.click(screen.getByText("Fetch Entries"));
    });

    await waitFor(() => {
      expect(screen.getByTestId("entries-data")).toHaveTextContent(
        JSON.stringify({
          entries: [{ id: 1, mood: "happy", content: "Great day!" }],
        }),
      );
    });

    // Updated expectations to account for CSRF token fetch:
    // 1. /auth/me (initial load)
    // 2. /entries (401 response)
    // 3. /auth/csrf-token (for refresh POST request)
    // 4. /entries (retry after refresh)
    expect(mock.history.get.length).toBe(4);
    expect(mock.history.post.length).toBe(1);
    expect(mock.history.post[0].url).toBe("/auth/refresh");
  });
});
