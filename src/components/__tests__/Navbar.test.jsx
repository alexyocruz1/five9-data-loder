import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { BrowserRouter as Router } from 'react-router-dom';
import NavbarComponent from '../Navbar';

describe('NavbarComponent', () => {
  test('renders the navbar brand', () => {
    render(
      <Router>
        <NavbarComponent />
      </Router>
    );
    const brandElement = screen.getByText(/Five9 Dataloader/i);
    expect(brandElement).toBeInTheDocument();
  });

  test('renders the Home link', () => {
    render(
      <Router>
        <NavbarComponent />
      </Router>
    );
    const homeLink = screen.getByText(/Home/i);
    expect(homeLink).toBeInTheDocument();
  });

  test('renders the Contacts dropdown', () => {
    render(
      <Router>
        <NavbarComponent />
      </Router>
    );
    const dropdownElement = screen.getByText(/Contacts/i);
    expect(dropdownElement).toBeInTheDocument();
  });

  test('renders the Get all contacts item in the dropdown', () => {
    render(
      <Router>
        <NavbarComponent />
      </Router>
    );
    // Open the dropdown menu
    fireEvent.click(screen.getByText(/Contacts/i));
    const dropdownItem = screen.getByText(/Get all contacts/i);
    expect(dropdownItem).toBeInTheDocument();
  });
});