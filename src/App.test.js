// app.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Home component by default', () => {
  render(<App />);
  const homeElement = screen.getByText(/Home/i);
  expect(homeElement).toBeInTheDocument();
});

test('renders Contacts component when navigating to /contacts', () => {
  render(<App />);
  const contactsElements = screen.getAllByText(/Contacts/i);
  expect(contactsElements[0]).toBeInTheDocument();
});