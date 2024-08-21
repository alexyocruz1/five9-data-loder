import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Home component by default', () => {
  render(<App />);
  const homeElements = screen.getAllByText(/Home/i);
  expect(homeElements[0]).toBeInTheDocument();
});

test('renders Contacts component when navigating to /contacts', () => {
  render(<App />);
  const contactsElements = screen.getAllByText(/Contacts/i);
  expect(contactsElements[0]).toBeInTheDocument();
});