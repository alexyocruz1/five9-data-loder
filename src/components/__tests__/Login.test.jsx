import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Login from '../Login';

describe('Login Component', () => {
  const mockEndpoint = jest.fn();

  const renderComponent = (props = {}) => {
    return render(
      <Login endpoint={mockEndpoint} loading={false} {...props} />
    );
  };

  test('renders the username input', () => {
    renderComponent();
    const usernameInput = screen.getByPlaceholderText(/Enter your username/i);
    expect(usernameInput).toBeInTheDocument();
  });

  test('renders the password input', () => {
    renderComponent();
    const passwordInput = screen.getByPlaceholderText(/Enter your password/i);
    expect(passwordInput).toBeInTheDocument();
  });

  test('renders the remember username checkbox', () => {
    renderComponent();
    const rememberCheckbox = screen.getByLabelText(/Remember my username/i);
    expect(rememberCheckbox).toBeInTheDocument();
  });

  test('renders the submit button', () => {
    renderComponent();
    const submitButton = screen.getByRole('button', { name: /login/i });
    expect(submitButton).toBeInTheDocument();
  });

  test('displays validation errors on submit with empty fields', async () => {
    renderComponent();
    const submitButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(submitButton);

    const usernameError = await screen.findByText(/Username is required/i);
    const passwordError = await screen.findByText(/Password is required/i);

    expect(usernameError).toBeInTheDocument();
    expect(passwordError).toBeInTheDocument();
  });

  test('calls endpoint on form submission with valid data', async () => {
    renderComponent();
    const usernameInput = screen.getByPlaceholderText(/Enter your username/i);
    const passwordInput = screen.getByPlaceholderText(/Enter your password/i);
    const submitButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockEndpoint).toHaveBeenCalledWith('testuser', 'password', false);
    });
  });

  test('disables the submit button when loading', () => {
    renderComponent({ loading: true });
    const submitButton = screen.getByText(/Logging in.../i);
    expect(submitButton).toBeDisabled();
  });

  test('toggles password visibility', () => {
    renderComponent();
    const passwordInput = screen.getByPlaceholderText(/Enter your password/i);
    const toggleButton = screen.getByRole('button', { name: '' });

    expect(passwordInput).toHaveAttribute('type', 'password');
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('displays loading alert when loading', () => {
    renderComponent({ loading: true });
    const loadingAlert = screen.getByText(/Please wait while we process your request.../i);
    expect(loadingAlert).toBeInTheDocument();
  });
});