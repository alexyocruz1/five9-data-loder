import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { BrowserRouter as Router } from 'react-router-dom';
import NavbarComponent from '../Navbar';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => ({
    pathname: '/'
  })
}));

describe('NavbarComponent', () => {
  const renderNavbar = () => {
    render(
      <Router>
        <NavbarComponent />
      </Router>
    );
  };

  test('renders the navbar brand', () => {
    renderNavbar();
    const brandElement = screen.getByText(/Five9 Dataloader/i);
    expect(brandElement).toBeInTheDocument();
  });

  test('renders the Home link', () => {
    renderNavbar();
    const homeLink = screen.getByText(/Home/i);
    expect(homeLink).toBeInTheDocument();
  });

  test('renders the Contacts dropdown', () => {
    renderNavbar();
    const contactsDropdown = screen.getByText(/Contacts/i);
    expect(contactsDropdown).toBeInTheDocument();
  });

  test('renders the Users dropdown', () => {
    renderNavbar();
    const usersDropdown = screen.getByText(/Users/i);
    expect(usersDropdown).toBeInTheDocument();
  });

  test('renders the Skills dropdown', () => {
    renderNavbar();
    const skillsDropdown = screen.getByText(/Skills/i);
    expect(skillsDropdown).toBeInTheDocument();
  });

  test('expands and collapses navbar on toggle click', async () => {
    renderNavbar();
    
    const toggleButton = screen.getByRole('button', { name: /toggle navigation/i });
    const collapseElement = screen.getByTestId('navbar-collapse');

    expect(collapseElement).not.toHaveClass('show');

    fireEvent.click(toggleButton);
    await waitFor(() => {
      expect(collapseElement).toHaveClass('show');
    });

    fireEvent.click(toggleButton);
    await waitFor(() => {
      expect(collapseElement).not.toHaveClass('show');
    });
  });

  test('closes navbar when a link is clicked', () => {
    renderNavbar();
    const toggleButton = screen.getByRole('button', { name: /toggle navigation/i });
    fireEvent.click(toggleButton);
    
    const homeLink = screen.getByText(/Home/i);
    fireEvent.click(homeLink);
    
    expect(screen.getByRole('navigation')).not.toHaveClass('show');
  });

  test('renders all dropdown items for Users', () => {
    renderNavbar();
    fireEvent.click(screen.getByText(/Users/i));
    
    expect(screen.getByText(/Create users/i)).toBeInTheDocument();
    expect(screen.getByText(/Update users/i)).toBeInTheDocument();
    expect(screen.getByText(/Remove users/i)).toBeInTheDocument();
    expect(screen.getByText(/Get users info/i)).toBeInTheDocument();
    expect(screen.getByText(/Get users by skill/i)).toBeInTheDocument();
  });

  test('renders dropdown item for Skills', () => {
    renderNavbar();
    fireEvent.click(screen.getByText(/Skills/i));
    
    expect(screen.getByText(/Add skill to user/i)).toBeInTheDocument();
  });
});