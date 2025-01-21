import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import React from "react";
import axios from "axios";

import AuthProvider, { AuthContext } from "./AuthContext";

//we need to mock axios so no real network calls happen
vi.mock("axios");


function TestConsumer() {
  const { user, loading, login, register, logout } = React.useContext(AuthContext);

  return (
    <div>
      {loading ? (
        <p data-testid="loading-state">Loading...</p>
      ) : user ? (
        <p data-testid="user-display">{user.username}</p>
      ) : (
        <p data-testid="user-display">No user</p>
      )}

      <button onClick={() => login({ identifier: "myuser", password: "mypass" })}>
        Test Login
      </button>
      <button
        onClick={() => register({ username: "NewUser", email: "new@email.com", password: "pass" })}
      >
        Test Register
      </button>
      <button onClick={() => logout()}>Test Logout</button>
    </div>
  );
}

describe("AuthProvider", () => {
  beforeEach(() => {
    //reset all mocks & localStorage
    vi.resetAllMocks();
    localStorage.clear();
  });

  it("loads a cached user from localStorage (skips /api/auth/me)", async () => {
    //put a user in localStorage
    localStorage.setItem("user", JSON.stringify({ id: 1, username: "CachedUser" }));

    //if /api/auth/me was called, let's have it fail with 401
    axios.get.mockRejectedValue({ response: { status: 401 } });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    //wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByTestId("loading-state")).not.toBeInTheDocument();
    });

    //should display the cached user's name
    expect(screen.getByTestId("user-display")).toHaveTextContent("CachedUser");
    //also confirm that we never called /api/auth/me
    expect(axios.get).not.toHaveBeenCalled();
  });

  it("calls /api/auth/me if no cached user, sets user on success", async () => {
    //no user in localStorage
    //so it will call /api/auth/me
    axios.get.mockResolvedValueOnce({
      data: { user: { id: 2, username: "FetchedUser", email: "fetched@example.com" } },
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    //initially "Loading..."
    expect(screen.getByTestId("loading-state")).toBeInTheDocument();

    //wait for the effect to finish
    await waitFor(() => {
      expect(screen.queryByTestId("loading-state")).not.toBeInTheDocument();
    });

    //should now have user "FetchedUser"
    expect(screen.getByTestId("user-display")).toHaveTextContent("FetchedUser");

    //localStorage updated
    const stored = JSON.parse(localStorage.getItem("user"));
    expect(stored).toEqual({ id: 2, username: "FetchedUser", email: "fetched@example.com" });
  });

  it("handles 401 from /api/auth/me by leaving user null", async () => {
    //no cached user
    axios.get.mockRejectedValueOnce({ response: { status: 401 } });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    //wait for loading to end
    await waitFor(() => {
      expect(screen.queryByTestId("loading-state")).not.toBeInTheDocument();
    });

    //should show "No user"
    expect(screen.getByTestId("user-display")).toHaveTextContent("No user");
    //localStorage should remain empty
    expect(localStorage.getItem("user")).toBeNull();
  });

  it("login sets user on success, returns true", async () => {
    //if no cached user, the effect calls /api/auth/me => let's have it fail w/401
    axios.get.mockRejectedValueOnce({ response: { status: 401 } });

    //login success
    axios.post.mockResolvedValueOnce({
      status: 200,
      data: { user: { id: 10, username: "LoggedIn", email: "logged@example.com" } },
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    //wait for "Loading..." to end
    await waitFor(() => {
      expect(screen.queryByTestId("loading-state")).not.toBeInTheDocument();
    });

    //initially "No user"
    expect(screen.getByTestId("user-display")).toHaveTextContent("No user");

    //trigger login by clicking the test button
    let loginResult;
    await act(async () => {
      //capturing the promise so we can check it
      loginResult = screen.getByText("Test Login").click();
    });

    //because we do not return the login result from the click,
    //let's just confirm the user changed
    expect(screen.getByTestId("user-display")).toHaveTextContent("LoggedIn");
    //localStorage
    expect(JSON.parse(localStorage.getItem("user"))).toEqual({
      id: 10,
      username: "LoggedIn",
      email: "logged@example.com",
    });
  });

  it("login returns false & doesn't set user if server error", async () => {
    axios.get.mockRejectedValueOnce({ response: { status: 401 } });
    axios.post.mockRejectedValueOnce({ response: { status: 400, data: { error: "Invalid credentials" } } });

    let contextRef;
    function ConsumerWithRef() {
      const ctx = React.useContext(AuthContext);
      contextRef = ctx;
      return <div>Consumer</div>;
    }

    render(
      <AuthProvider>
        <ConsumerWithRef />
      </AuthProvider>
    );

    //wait for loading
    await waitFor(() => {
      expect(contextRef.loading).toBe(false);
    });

    //user is null
    expect(contextRef.user).toBeNull();

    //attempt login
    let result;
    await act(async () => {
      result = await contextRef.login({ identifier: "bad", password: "wrong" });
    });

    expect(result).toBe(false);
    expect(contextRef.user).toBeNull();
    expect(localStorage.getItem("user")).toBeNull();
  });

  it("register sets user on success, returns true", async () => {
    axios.get.mockRejectedValueOnce({ response: { status: 401 } });
    axios.post.mockResolvedValueOnce({
      status: 201,
      data: { user: { id: 99, username: "NewUser", email: "new@example.com" } },
    });

    let contextRef;
    function ConsumerWithRef() {
      contextRef = React.useContext(AuthContext);
      return <div>Consumer</div>;
    }

    render(
      <AuthProvider>
        <ConsumerWithRef />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(contextRef.loading).toBe(false);
    });
    expect(contextRef.user).toBeNull();

    let regResult;
    await act(async () => {
      regResult = await contextRef.register({ username: "NewUser", email: "new@example.com", password: "pass" });
    });

    expect(regResult).toBe(true);
    expect(contextRef.user).toEqual({
      id: 99,
      username: "NewUser",
      email: "new@example.com",
    });
    expect(JSON.parse(localStorage.getItem("user"))).toEqual({
      id: 99,
      username: "NewUser",
      email: "new@example.com",
    });
  });

  it("register returns false if server error", async () => {
    axios.get.mockRejectedValueOnce({ response: { status: 401 } });
    axios.post.mockResolvedValueOnce({ status: 400, data: { error: "Email already taken" } });

    let contextRef;
    function ConsumerWithRef() {
      contextRef = React.useContext(AuthContext);
      return <div>Consumer</div>;
    }

    render(
      <AuthProvider>
        <ConsumerWithRef />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(contextRef.loading).toBe(false);
    });

    let regResult;
    await act(async () => {
      regResult = await contextRef.register({ username: "FailUser", email: "fail@example.com", password: "pass" });
    });

    expect(regResult).toBe(false);
    expect(contextRef.user).toBeNull();
    expect(localStorage.getItem("user")).toBeNull();
  });

  it("logout clears user & localStorage on success, returns true", async () => {
    //if localStorage has a user, AuthContext won't call /api/auth/me
    localStorage.setItem("user", JSON.stringify({ id: 123, username: "PreUser" }));

    //suppose logout succeeds
    axios.post.mockResolvedValueOnce({ status: 200, data: { message: "Logged out" } });

    let contextRef;
    function ConsumerWithRef() {
      contextRef = React.useContext(AuthContext);
      return <div>Consumer</div>;
    }

    render(
      <AuthProvider>
        <ConsumerWithRef />
      </AuthProvider>
    );

    //initially user is from localStorage
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
    expect(localStorage.getItem("user")).toBeNull();
  });

  it("logout returns false & keeps user if server throws error", async () => {
    localStorage.setItem("user", JSON.stringify({ id: 500, username: "FailLogout" }));
    axios.post.mockRejectedValue(new Error("Server died"));

    let contextRef;
    function ConsumerWithRef() {
      contextRef = React.useContext(AuthContext);
      return <div>Consumer</div>;
    }

    render(
      <AuthProvider>
        <ConsumerWithRef />
      </AuthProvider>
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
    //user remains
    expect(contextRef.user.username).toBe("FailLogout");
    expect(localStorage.getItem("user")).toContain("FailLogout");
  });
});
