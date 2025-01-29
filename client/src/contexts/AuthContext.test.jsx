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

//initialize Axios Mock Adapter with the custom axios instance
const mock = new MockAdapter(axiosInstance);

function TestConsumer() {
  const { user, loading, login, register, logout } =
    React.useContext(AuthContext);
  const [protectedData, setProtectedData] = useState(null);
  const [protectedError, setProtectedError] = useState(null);

  //function to fetch data from a protected API endpoint
  const fetchProtectedData = async () => {
    try {
      const response = await axiosInstance.get("/protected");
      setProtectedData(response.data);
      setProtectedError(null);
    } catch (error) {
      setProtectedError(error.response?.data?.error || "Error fetching data");
      setProtectedData(null);
    }
  };

  return (
    <div>
      //show loading state or display user information
      {loading ? (
        <p data-testid="loading-state">Loading...</p>
      ) : user ? (
        <p data-testid="user-display">{user.username}</p>
      ) : (
        <p data-testid="user-display">No user</p>
      )}
      //buttons to test authentication flows
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
      //button to trigger fetching of protected data
      <button onClick={fetchProtectedData}>Fetch Protected Data</button>
      //display fetched protected data or error messages
      {protectedData && (
        <p data-testid="protected-data">{JSON.stringify(protectedData)}</p>
      )}
      {protectedError && <p data-testid="protected-error">{protectedError}</p>}
    </div>
  );
}

describe("AuthProvider", () => {
  beforeEach(() => {
    //reset mocks and clear localStorage before each test to ensure isolation
    mock.reset();
    localStorage.clear();
  });

  it("loads a cached user from localStorage without calling /api/auth/me", async () => {
    //set a cached user in localStorage
    localStorage.setItem(
      "user",
      JSON.stringify({ id: 1, username: "CachedUser" }),
    );

    //render AuthProvider with TestConsumer
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    //wait until loading indicator is removed
    await waitFor(() => {
      expect(screen.queryByTestId("loading-state")).not.toBeInTheDocument();
    });

    //check that the cached user's username is displayed
    expect(screen.getByTestId("user-display")).toHaveTextContent("CachedUser");

    //verify that /auth/me was not called since user was loaded from cache
    expect(mock.history.get.length).toBe(0);
  });

  it("fetches and sets user when no cached user is present", async () => {
    //mock successful response from /auth/me endpoint
    mock.onGet("/auth/me").reply(200, {
      user: { id: 2, username: "FetchedUser", email: "fetched@example.com" },
    });

    //render AuthProvider with TestConsumer
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    //ensure loading indicator is visible initially
    expect(screen.getByTestId("loading-state")).toBeInTheDocument();

    //wait until loading indicator is removed
    await waitFor(() => {
      expect(screen.queryByTestId("loading-state")).not.toBeInTheDocument();
    });

    //check that the fetched user's username is displayed
    expect(screen.getByTestId("user-display")).toHaveTextContent("FetchedUser");

    //verify that user data is stored in localStorage
    const stored = JSON.parse(localStorage.getItem("user"));
    expect(stored).toEqual({
      id: 2,
      username: "FetchedUser",
      email: "fetched@example.com",
    });
  });

  it("handles unauthorized access by not setting a user when /api/auth/me returns 401", async () => {
    //mock a 401 Unauthorized response from /auth/me endpoint
    mock.onGet("/auth/me").reply(401);

    //render AuthProvider with TestConsumer
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    //wait until loading indicator is removed
    await waitFor(() => {
      expect(screen.queryByTestId("loading-state")).not.toBeInTheDocument();
    });

    //verify that no user is displayed
    expect(screen.getByTestId("user-display")).toHaveTextContent("No user");

    //ensure localStorage remains empty
    expect(localStorage.getItem("user")).toBeNull();
  });

  it("successfully logs in a user and updates the context and localStorage", async () => {
    //mock a successful login response
    mock.onPost("/auth/login").reply(200, {
      user: { id: 10, username: "LoggedIn", email: "logged@example.com" },
    });

    //render AuthProvider with TestConsumer
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    //wait until loading indicator is removed
    await waitFor(() => {
      expect(screen.queryByTestId("loading-state")).not.toBeInTheDocument();
    });

    //confirm that no user is initially logged in
    expect(screen.getByTestId("user-display")).toHaveTextContent("No user");

    //simulate clicking the login button
    await act(async () => {
      fireEvent.click(screen.getByText("Test Login"));
    });

    //verify that the logged-in user's username is displayed
    expect(screen.getByTestId("user-display")).toHaveTextContent("LoggedIn");

    //check that user data is stored in localStorage
    expect(JSON.parse(localStorage.getItem("user"))).toEqual({
      id: 10,
      username: "LoggedIn",
      email: "logged@example.com",
    });
  });

  it("prevents login and maintains no user state when server returns an error", async () => {
    //mock a failed login attempt with a 400 Bad Request
    mock.onPost("/auth/login").reply(400, {
      error: "Invalid credentials",
    });

    let contextRef;
    function ConsumerWithRef() {
      const ctx = React.useContext(AuthContext);
      contextRef = ctx;
      return <div>Consumer</div>;
    }

    //render AuthProvider with a consumer to access context reference
    render(
      <AuthProvider>
        <ConsumerWithRef />
      </AuthProvider>,
    );

    //wait until loading is complete
    await waitFor(() => {
      expect(contextRef.loading).toBe(false);
    });

    //ensure no user is set in the context
    expect(contextRef.user).toBeNull();

    //attempt to log in with invalid credentials
    let result;
    await act(async () => {
      result = await contextRef.login({ identifier: "bad", password: "wrong" });
    });

    //verify that login failed and user remains unset
    expect(result).toBe(false);
    expect(contextRef.user).toBeNull();
    expect(localStorage.getItem("user")).toBeNull();
  });

  it("successfully registers a new user and updates context and localStorage", async () => {
    //mock a successful registration response
    mock.onPost("/auth/register").reply(201, {
      user: { id: 99, username: "NewUser", email: "new@example.com" },
    });

    let contextRef;
    function ConsumerWithRef() {
      contextRef = React.useContext(AuthContext);
      return <div>Consumer</div>;
    }

    //render AuthProvider with a consumer to access context reference
    render(
      <AuthProvider>
        <ConsumerWithRef />
      </AuthProvider>,
    );

    //wait until loading is complete
    await waitFor(() => {
      expect(contextRef.loading).toBe(false);
    });

    //ensure no user is initially set
    expect(contextRef.user).toBeNull();

    //simulate user registration
    let regResult;
    await act(async () => {
      regResult = await contextRef.register({
        username: "NewUser",
        email: "new@example.com",
        password: "pass",
      });
    });

    //confirm that registration was successful
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

  it("prevents registration and maintains no user state when server returns an error", async () => {
    //mock a failed registration attempt with a 400 Bad Request
    mock.onPost("/auth/register").reply(400, {
      error: "Email already taken",
    });

    let contextRef;
    function ConsumerWithRef() {
      contextRef = React.useContext(AuthContext);
      return <div>Consumer</div>;
    }

    //render AuthProvider with a consumer to access context reference
    render(
      <AuthProvider>
        <ConsumerWithRef />
      </AuthProvider>,
    );

    //wait until loading is complete
    await waitFor(() => {
      expect(contextRef.loading).toBe(false);
    });

    //attempt to register with an already taken email
    let regResult;
    await act(async () => {
      regResult = await contextRef.register({
        username: "FailUser",
        email: "fail@example.com",
        password: "pass",
      });
    });

    //verify that registration failed and user remains unset
    expect(regResult).toBe(false);
    expect(contextRef.user).toBeNull();
    expect(localStorage.getItem("user")).toBeNull();
  });

  it("successfully logs out a user and clears context and localStorage", async () => {
    //set a logged-in user in localStorage
    localStorage.setItem(
      "user",
      JSON.stringify({ id: 123, username: "PreUser" }),
    );

    //mock a successful logout response
    mock.onPost("/auth/logout").reply(200, {
      message: "Logged out",
    });

    let contextRef;
    function ConsumerWithRef() {
      contextRef = React.useContext(AuthContext);
      return <div>Consumer</div>;
    }

    //render AuthProvider with a consumer to access context reference
    render(
      <AuthProvider>
        <ConsumerWithRef />
      </AuthProvider>,
    );

    //wait until loading is complete
    await waitFor(() => {
      expect(contextRef.loading).toBe(false);
    });

    //verify that the user is initially logged in
    expect(contextRef.user.username).toBe("PreUser");

    //simulate logging out
    let logoutResult;
    await act(async () => {
      logoutResult = await contextRef.logout();
    });

    //confirm that logout was successful and user data is cleared
    expect(logoutResult).toBe(true);
    expect(contextRef.user).toBeNull();
    expect(localStorage.getItem("user")).toBeNull();
  });

  it("prevents logout and retains user state when server returns an error", async () => {
    //set a logged-in user in localStorage
    localStorage.setItem(
      "user",
      JSON.stringify({ id: 500, username: "FailLogout" }),
    );

    //mock a failed logout attempt with a 500 Internal Server Error
    mock.onPost("/auth/logout").reply(500, {
      message: "Server died",
    });

    let contextRef;
    function ConsumerWithRef() {
      contextRef = React.useContext(AuthContext);
      return <div>Consumer</div>;
    }

    //render AuthProvider with a consumer to access context reference
    render(
      <AuthProvider>
        <ConsumerWithRef />
      </AuthProvider>,
    );

    //wait until loading is complete
    await waitFor(() => {
      expect(contextRef.loading).toBe(false);
    });

    //verify that the user is initially logged in
    expect(contextRef.user.username).toBe("FailLogout");

    //attempt to log out
    let logoutResult;
    await act(async () => {
      logoutResult = await contextRef.logout();
    });

    //verify that logout failed and user data remains intact
    expect(logoutResult).toBe(false);
    expect(contextRef.user.username).toBe("FailLogout");
    expect(localStorage.getItem("user")).toContain("FailLogout");
  });

  it("automatically refreshes access token upon receiving a 401 and retries the original request", async () => {
    //set a logged-in user in localStorage
    localStorage.setItem(
      "user",
      JSON.stringify({ id: 1, username: "CachedUser" }),
    );

    //mock the initial protected request to return a 401 Unauthorized
    mock.onGet("/protected").replyOnce(401);

    //mock the token refresh request to succeed
    mock.onPost("/auth/refresh").replyOnce(200, {
      message: "Access token refreshed",
    });

    //mock the retried protected request to succeed
    mock.onGet("/protected").replyOnce(200, {
      secretData: "This is protected data.",
    });

    //render AuthProvider with TestConsumer
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    //verify that the cached user's username is displayed
    await waitFor(() => {
      expect(screen.getByTestId("user-display")).toHaveTextContent(
        "CachedUser",
      );
    });

    //simulate fetching protected data, which should trigger a token refresh
    await act(async () => {
      fireEvent.click(screen.getByText("Fetch Protected Data"));
    });

    //confirm that the protected data is successfully fetched and displayed
    await waitFor(() => {
      expect(screen.getByTestId("protected-data")).toHaveTextContent(
        JSON.stringify({ secretData: "This is protected data." }),
      );
    });

    //validate the sequence of Axios calls:
    //1.initial protected GET request
    //2.token refresh POST request
    //3.retried protected GET request
    expect(mock.history.get.length).toBe(2);
    expect(mock.history.get[0].url).toBe("/protected");
    expect(mock.history.get[1].url).toBe("/protected");

    expect(mock.history.post.length).toBe(1);
    expect(mock.history.post[0].url).toBe("/auth/refresh");
  });
});
