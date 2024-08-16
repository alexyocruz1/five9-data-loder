// app.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import App from '../../App'; // Adjust the import path as needed
import Login from '../Login';

describe('Login Component', () => {
  const mockFetchAllContacts = jest.fn();

  const renderComponent = (props = {}) => {
    return render(
      <Login fetchAllContacts={mockFetchAllContacts} loading={false} {...props} />
    );
  };

  test('renders the username input', () => {
    renderComponent();
    const usernameInput = screen.getByPlaceholderText(/Username/i);
    expect(usernameInput).toBeInTheDocument();
  });

  test('renders the password input', () => {
    renderComponent();
    const passwordInput = screen.getByPlaceholderText(/Password/i);
    expect(passwordInput).toBeInTheDocument();
  });

  test('renders the remember username checkbox', () => {
    renderComponent();
    const rememberCheckbox = screen.getByLabelText(/Remember my username/i);
    expect(rememberCheckbox).toBeInTheDocument();
  });

  test('renders the submit button', () => {
    renderComponent();
    const submitButton = screen.getByText(/Login/i);
    expect(submitButton).toBeInTheDocument();
  });

  test('displays validation errors on submit with empty fields', async () => {
    renderComponent();
    const submitButton = screen.getByText(/Login/i);
    fireEvent.click(submitButton);

    const usernameError = await screen.findByText(/Username is required/i);
    const passwordError = await screen.findByText(/Password is required/i);

    expect(usernameError).toBeInTheDocument();
    expect(passwordError).toBeInTheDocument();
  });

  test('calls fetchAllContacts on form submission with valid data', async () => {
    renderComponent();
    const usernameInput = screen.getByPlaceholderText(/Username/i);
    const passwordInput = screen.getByPlaceholderText(/Password/i);
    const submitButton = screen.getByText(/Login/i);

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockFetchAllContacts).toHaveBeenCalledWith('testuser', 'password', false);
    });
  });

  test('disables the submit button when loading', () => {
    renderComponent({ loading: true });
    const submitButton = screen.getByText(/Loading.../i);
    expect(submitButton).toBeDisabled();
  });

  test('renders Contacts component when navigating to /contacts', () => {
    render(<App />);
    const contactsElements = screen.getAllByText(/Contacts/i);
    expect(contactsElements[0]).toBeInTheDocument();
  });
});