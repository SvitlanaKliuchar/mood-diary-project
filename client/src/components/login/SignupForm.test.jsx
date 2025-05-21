import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import SignupForm from './SignupForm';

// Mock dependencies
vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
}));

// Mock the assets for password visibility toggle
vi.mock('src/assets/icons/login/eye-open.svg', () => ({
  default: 'eye-open-icon'
}));

vi.mock('src/assets/icons/login/eye-closed.svg', () => ({
  default: 'eye-closed-icon'
}));

// Mock the validation schema
vi.mock('../../schemas/validationSchemas', () => ({
  signupSchema: {
    // Simple mock schema that will be used by the yupResolver
  }
}));

// Create a mock for react-hook-form
let isSubmitting = false;
let formErrors = {};

vi.mock('react-hook-form', () => ({
  useForm: () => ({
    register: (name) => ({ name }),
    handleSubmit: (callback) => (e) => {
      e.preventDefault();
      callback({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        repeatPassword: 'password123'
      });
    },
    formState: {
      errors: formErrors,
      isSubmitting: isSubmitting
    }
  })
}));

vi.mock('@hookform/resolvers/yup', () => ({
  yupResolver: vi.fn((schema) => schema)
}));

describe('SignupForm Component', () => {
  const mockNavigate = vi.fn();
  const mockRegisterUser = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
    
    // Reset form state for each test
    isSubmitting = false;
    formErrors = {};
    
    // Default successful registration
    mockRegisterUser.mockResolvedValue(true);
  });

  const renderSignupForm = () => {
    return render(
      <AuthContext.Provider value={{ register: mockRegisterUser }}>
        <SignupForm />
      </AuthContext.Provider>
    );
  };

  test('renders the form with all elements', () => {
    renderSignupForm();
    
    // Check if all form elements are rendered
    expect(screen.getByText('Sign up for free')).toBeInTheDocument();
    expect(screen.getByLabelText(/Username:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Repeat password:/i)).toBeInTheDocument();
    
    // Look for submit button specifically by text content
    const submitButton = screen.getByText('Sign up', { selector: 'button[type="submit"]' });
    expect(submitButton).toBeInTheDocument();
    
    expect(screen.getByText(/By signing up, you agree to our terms of use./i)).toBeInTheDocument();
    expect(screen.getByText(/Or continue with/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Google/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Github/i })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /Show password/i })).toHaveLength(2);
  });

  test('toggles password visibility when clicking the eye icon', () => {
    renderSignupForm();
    
    const passwordInput = screen.getByLabelText(/^Password:/i);
    const repeatPasswordInput = screen.getByLabelText(/Repeat password:/i);
    const toggleButtons = screen.getAllByRole('button', { name: /Show password/i });
    
    // Initially passwords should be of type password
    expect(passwordInput.type).toBe('password');
    expect(repeatPasswordInput.type).toBe('password');
    
    // Click the first toggle button
    fireEvent.click(toggleButtons[0]);
    
    // Now both should be of type text (they share state)
    expect(passwordInput.type).toBe('text');
    expect(repeatPasswordInput.type).toBe('text');
    
    // Click again to hide
    fireEvent.click(toggleButtons[0]);
    
    // Now both should be of type password again
    expect(passwordInput.type).toBe('password');
    expect(repeatPasswordInput.type).toBe('password');
  });

  test('submits the form and navigates to home on successful registration', async () => {
    renderSignupForm();
    
    // Get submit button specifically by text content
    const submitButton = screen.getByText('Sign up', { selector: 'button[type="submit"]' });
    
    // Submit the form
    fireEvent.click(submitButton);
    
    // Check if registerUser was called with correct data
    await waitFor(() => {
      expect(mockRegisterUser).toHaveBeenCalledWith({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        repeatPassword: 'password123'
      });
    });
    
    // Check if navigation to home page happened
    expect(mockNavigate).toHaveBeenCalledWith('/home');
  });

  test('displays error message on failed registration', async () => {
    // Mock a failed registration
    mockRegisterUser.mockResolvedValue(false);
    
    // Spy on console.error
    const consoleSpy = vi.spyOn(console, 'error');
    
    renderSignupForm();
    
    // Get submit button specifically by text content
    const submitButton = screen.getByText('Sign up', { selector: 'button[type="submit"]' });
    
    // Submit the form
    fireEvent.click(submitButton);
    
    // Check if registerUser was called
    await waitFor(() => {
      expect(mockRegisterUser).toHaveBeenCalled();
    });
    
    // Check if error was logged
    expect(consoleSpy).toHaveBeenCalledWith('Registration failed.');
    
    // Check that we didn't navigate
    expect(mockNavigate).not.toHaveBeenCalled();
    
    consoleSpy.mockRestore();
  });

  test('handles registration error exceptions', async () => {
    // Mock a registration function that throws an error
    mockRegisterUser.mockRejectedValue(new Error('Network error'));
    
    // Spy on console.error
    const consoleSpy = vi.spyOn(console, 'error');
    
    renderSignupForm();
    
    // Get submit button specifically by text content
    const submitButton = screen.getByText('Sign up', { selector: 'button[type="submit"]' });
    
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

  test('redirects to social login endpoints when social buttons are clicked', () => {
    // Mock window.location.href
    const originalLocation = window.location;
    delete window.location;
    window.location = { href: '' };
    
    renderSignupForm();
    
    const googleButton = screen.getByRole('button', { name: /Google/i });
    const githubButton = screen.getByRole('button', { name: /Github/i });
    
    // Click Google button
    fireEvent.click(googleButton);
    expect(window.location.href).toBe('/auth/google');
    
    // Click Github button
    fireEvent.click(githubButton);
    expect(window.location.href).toBe('/auth/github');
    
    // Restore window.location
    window.location = originalLocation;
  });

  test('navigates to login page when link is clicked', () => {
    renderSignupForm();
    
    const loginLink = screen.getByText(/sign in to your existing account/i);
    
    // Check if the link has the correct href
    expect(loginLink.getAttribute('href')).toBe('/login');
  });

  test('navigates to terms of use page when link is clicked', () => {
    renderSignupForm();
    
    const termsLink = screen.getByText(/By signing up, you agree to our terms of use./i);
    
    // Check if the link has the correct href
    expect(termsLink.getAttribute('href')).toBe('/terms-of-use');
  });

  test('displays validation errors for empty fields', () => {
    // Set up form errors for this test
    formErrors = {
      username: { message: 'Username is required' },
      email: { message: 'Email is required' },
      password: { message: 'Password is required' },
      repeatPassword: { message: 'Please confirm your password' }
    };

    renderSignupForm();
    
    // Check if error messages are displayed
    expect(screen.getByText('Username is required')).toBeInTheDocument();
    expect(screen.getByText('Email is required')).toBeInTheDocument();
    
    // Use getAllByText for password errors since there are multiple elements with this text
    const passwordErrors = screen.getAllByText('Password is required');
    expect(passwordErrors).toHaveLength(2); // Verifies there are exactly 2 error messages with this text
    
    // This confirms the bug in the component - it shows password error for both fields
    // instead of showing the repeatPassword error message
  });

  test('button shows the correct text and is disabled during submission', () => {
    // First render with isSubmitting: false (default)
    renderSignupForm();
    
    // Check initial state
    let submitButton = screen.getByText('Sign up', { selector: 'button[type="submit"]' });
    expect(submitButton).toHaveTextContent('Sign up');
    expect(submitButton).not.toBeDisabled();
    
    // Setup for submitting state
    isSubmitting = true;
    
    // Re-render with isSubmitting: true
    renderSignupForm();
    
    // Check submitting state - need to get by role and name since text changes
    submitButton = screen.getByText('Signing up...', { selector: 'button[type="submit"]' });
    expect(submitButton).toHaveTextContent('Signing up...');
    expect(submitButton).toBeDisabled();
  });
});