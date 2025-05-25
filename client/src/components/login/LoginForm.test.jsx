import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, test, expect, beforeEach, vi } from "vitest";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import LoginForm from "./LoginForm";

// Mock dependencies
vi.mock("react-router-dom", () => ({
  useNavigate: vi.fn(),
}));

// Mock the assets for password visibility toggle
vi.mock("../../assets/icons/login/eye-open.svg", () => ({
  default: "eye-open-icon",
}));

vi.mock("../../assets/icons/login/eye-closed.svg", () => ({
  default: "eye-closed-icon",
}));

// Mock the validation schema
vi.mock("../../schemas/validationSchemas", () => ({
  loginSchema: {
    // Simple mock schema that will be used by the yupResolver
  },
}));

// Create a mock for react-hook-form
let isSubmitting = false;
let formErrors = {};

vi.mock("react-hook-form", () => ({
  useForm: () => ({
    register: (name) => ({ name }),
    handleSubmit: (callback) => (e) => {
      e.preventDefault();
      callback({ identifier: "testuser", password: "password123" });
    },
    formState: {
      errors: formErrors,
      isSubmitting: isSubmitting,
    },
  }),
}));

vi.mock("@hookform/resolvers/yup", () => ({
  yupResolver: vi.fn((schema) => schema),
}));

describe("LoginForm Component", () => {
  const mockNavigate = vi.fn();
  const mockLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);

    // Reset form state for each test
    isSubmitting = false;
    formErrors = {};

    // Default successful login
    mockLogin.mockResolvedValue(true);
  });

  const renderLoginForm = () => {
    return render(
      <AuthContext.Provider value={{ login: mockLogin }}>
        <LoginForm />
      </AuthContext.Provider>,
    );
  };

  test("renders the form with all elements", () => {
    renderLoginForm();

    // Check if all form elements are rendered
    expect(screen.getByText("Sign in to your account")).toBeInTheDocument();
    expect(screen.getByLabelText(/Username or email:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password:/i)).toBeInTheDocument();

    // Look for submit button specifically by text content
    const submitButton = screen.getByText("Sign in", {
      selector: 'button[type="submit"]',
    });
    expect(submitButton).toBeInTheDocument();

    expect(screen.getByText(/Remember me/i)).toBeInTheDocument();
    expect(screen.getByText(/Forgot your password?/i)).toBeInTheDocument();
    expect(screen.getByText(/Or continue with/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Google/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Github/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Show password/i }),
    ).toBeInTheDocument();
  });

  test("toggles password visibility when clicking the eye icon", () => {
    renderLoginForm();

    const passwordInput = screen.getByLabelText(/Password:/i);
    const toggleButton = screen.getByRole("button", { name: /Show password/i });

    // Initially password should be of type password
    expect(passwordInput.type).toBe("password");

    // Click the toggle button
    fireEvent.click(toggleButton);

    // Now it should be of type text
    expect(passwordInput.type).toBe("text");

    // Click again to hide
    fireEvent.click(toggleButton);

    // Now it should be of type password again
    expect(passwordInput.type).toBe("password");
  });

  test("submits the form and navigates to home on successful login", async () => {
    renderLoginForm();

    // Get submit button specifically by text content
    const submitButton = screen.getByText("Sign in", {
      selector: 'button[type="submit"]',
    });

    // Submit the form
    fireEvent.click(submitButton);

    // Check if login was called with correct data
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        identifier: "testuser",
        password: "password123",
      });
    });

    // Check if navigation to home page happened
    expect(mockNavigate).toHaveBeenCalledWith("/home");
  });

  test("displays error message on failed login", async () => {
    // Mock a failed login
    mockLogin.mockResolvedValue(false);

    // Spy on console.error
    const consoleSpy = vi.spyOn(console, "error");

    renderLoginForm();

    // Get submit button specifically by text content
    const submitButton = screen.getByText("Sign in", {
      selector: 'button[type="submit"]',
    });

    // Submit the form
    fireEvent.click(submitButton);

    // Check if login was called
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalled();
    });

    // Check if error was logged
    expect(consoleSpy).toHaveBeenCalledWith(
      "Login failed. Check credentials or network issues.",
    );

    // Check that we didn't navigate
    expect(mockNavigate).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  test("handles login error exceptions", async () => {
    // Mock a login function that throws an error
    mockLogin.mockRejectedValue(new Error("Network error"));

    // Spy on console.error
    const consoleSpy = vi.spyOn(console, "error");

    renderLoginForm();

    // Get submit button specifically by text content
    const submitButton = screen.getByText("Sign in", {
      selector: 'button[type="submit"]',
    });

    // Submit the form
    fireEvent.click(submitButton);

    // Check if error was logged
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });

    // Check that we didn't navigate
    expect(mockNavigate).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  test("redirects to social login endpoints when social buttons are clicked", () => {
    // Mock window.location.href
    const originalLocation = window.location;
    delete window.location;
    window.location = { href: "" };

    renderLoginForm();

    const googleButton = screen.getByRole("button", { name: /Google/i });
    const githubButton = screen.getByRole("button", { name: /Github/i });

    // Click Google button
    fireEvent.click(googleButton);
    expect(window.location.href).toBe("/auth/google");

    // Click Github button
    fireEvent.click(githubButton);
    expect(window.location.href).toBe("/auth/github");

    // Restore window.location
    window.location = originalLocation;
  });

  test("navigates to forgot password page when link is clicked", () => {
    renderLoginForm();

    const forgotPasswordLink = screen.getByText(/Forgot your password\?/i);

    // Check if the link has the correct href
    expect(forgotPasswordLink.getAttribute("href")).toBe("/forgot-password");
  });

  test("navigates to signup page when link is clicked", () => {
    renderLoginForm();

    const signupLink = screen.getByText(/sign up for a new account/i);

    // Check if the link has the correct href
    expect(signupLink.getAttribute("href")).toBe("/signup");
  });

  test("displays validation errors for empty fields", () => {
    // Set up form errors for this test
    formErrors = {
      identifier: { message: "Username or email is required" },
      password: { message: "Password is required" },
    };

    renderLoginForm();

    // Check if error messages are displayed
    expect(
      screen.getByText("Username or email is required"),
    ).toBeInTheDocument();
    expect(screen.getByText("Password is required")).toBeInTheDocument();
  });

  test("button shows the correct text and is disabled during submission", () => {
    // First render with isSubmitting: false (default)
    renderLoginForm();

    // Check initial state
    let submitButton = screen.getByText("Sign in", {
      selector: 'button[type="submit"]',
    });
    expect(submitButton).toHaveTextContent("Sign in");
    expect(submitButton).not.toBeDisabled();

    // Setup for submitting state
    isSubmitting = true;

    // Re-render with isSubmitting: true
    renderLoginForm();

    // Check submitting state - need to get by role and name since text changes
    submitButton = screen.getByText("Signing in...", {
      selector: 'button[type="submit"]',
    });
    expect(submitButton).toHaveTextContent("Signing in...");
    expect(submitButton).toBeDisabled();
  });
});
