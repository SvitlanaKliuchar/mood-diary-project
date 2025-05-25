import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import EmailForm from "./EmailForm";
import axiosInstance from "../../../utils/axiosInstance.js";

// Mock dependencies
vi.mock("../../../utils/axiosInstance.js", () => ({
  default: {
    post: vi.fn(),
  },
}));

// Mock CSS module
vi.mock("../Login.module.css", () => ({
  default: {
    "form-container": "mock-form-container",
    "email-form": "mock-email-form",
    "reset-form-group": "mock-reset-form-group",
    "input-field": "mock-input-field",
    "reset-btn": "mock-reset-btn",
    "login-btn": "mock-login-btn",
    message: "mock-message",
  },
}));

describe("EmailForm Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the form correctly", () => {
    render(<EmailForm />);

    // Check if title is displayed
    expect(screen.getByText("Forgot your password?")).toBeInTheDocument();

    // Check if email input exists
    expect(
      screen.getByLabelText("What's your email address?"),
    ).toBeInTheDocument();

    // Check if submit button exists
    expect(
      screen.getByRole("button", { name: /send reset link/i }),
    ).toBeInTheDocument();
  });

  it("disables the submit button when email is empty", () => {
    render(<EmailForm />);

    const submitButton = screen.getByRole("button", {
      name: /send reset link/i,
    });

    // Button should be disabled initially (as email is empty)
    expect(submitButton).toBeDisabled();

    // Enter an email and check if button is enabled
    const emailInput = screen.getByLabelText("What's your email address?");
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });

    expect(submitButton).not.toBeDisabled();

    // Clear the email and check if button is disabled again
    fireEvent.change(emailInput, { target: { value: "" } });

    expect(submitButton).toBeDisabled();
  });

  it("submits the form with the email value", async () => {
    // Mock successful response
    axiosInstance.post.mockResolvedValueOnce({ status: 200 });

    render(<EmailForm />);

    // Fill the email input
    const emailInput = screen.getByLabelText("What's your email address?");
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });

    // Submit the form
    const submitButton = screen.getByRole("button", {
      name: /send reset link/i,
    });
    fireEvent.click(submitButton);

    // Check if axios was called with correct arguments
    expect(axiosInstance.post).toHaveBeenCalledWith("/auth/forgot-password", {
      email: "test@example.com",
    });

    // Check if success message appears
    await waitFor(() => {
      expect(
        screen.getByText("Password reset link sent. Check your email!"),
      ).toBeInTheDocument();
    });
  });

  it("shows error message when API call fails", async () => {
    // Mock failed response
    axiosInstance.post.mockRejectedValueOnce({
      response: {
        data: {
          message: "User not found",
        },
      },
    });

    render(<EmailForm />);

    // Fill the email input
    const emailInput = screen.getByLabelText("What's your email address?");
    fireEvent.change(emailInput, {
      target: { value: "nonexistent@example.com" },
    });

    // Submit the form
    const submitButton = screen.getByRole("button", {
      name: /send reset link/i,
    });
    fireEvent.click(submitButton);

    // Check if error message appears
    await waitFor(() => {
      expect(screen.getByText("User not found")).toBeInTheDocument();
    });
  });

  it("shows generic error message when API fails without specific message", async () => {
    // Mock network error with no response
    axiosInstance.post.mockRejectedValueOnce({});

    render(<EmailForm />);

    // Fill the email input
    const emailInput = screen.getByLabelText("What's your email address?");
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });

    // Submit the form
    const submitButton = screen.getByRole("button", {
      name: /send reset link/i,
    });
    fireEvent.click(submitButton);

    // Check if generic error message appears
    await waitFor(() => {
      expect(
        screen.getByText("Failed to send reset link. Please try again."),
      ).toBeInTheDocument();
    });
  });
});
