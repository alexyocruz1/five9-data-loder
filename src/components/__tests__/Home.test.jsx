import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Home from '../Home';

describe('Home Component', () => {
  test('renders the welcome message', () => {
    render(<Home />);
    const headingElement = screen.getByText(/Welcome to Five9 Dataloader/i);
    expect(headingElement).toBeInTheDocument();
  });

  test('renders the description paragraph', () => {
    render(<Home />);
    const paragraphElement = screen.getByText(/Manage your Five9 data efficiently with our comprehensive tools./i);
    expect(paragraphElement).toBeInTheDocument();
  });

  test('renders the Available Functions section', () => {
    render(<Home />);
    const sectionHeading = screen.getByText(/Available Functions/i);
    expect(sectionHeading).toBeInTheDocument();
  });

  test('renders all function cards', () => {
    render(<Home />);
    const functionNames = [
      'Get all contacts',
      'Get users general info',
      'Get users info by Skill',
      'Create user',
      'Update users general info',
      'Add skills to user',
      'Remove user'
    ];

    functionNames.forEach(name => {
      const cardTitle = screen.getByText(name);
      expect(cardTitle).toBeInTheDocument();
    });
  });

  test('renders badges for data requirements', () => {
    render(<Home />);
    const requiresDataBadges = screen.getAllByText('Requires Data');
    const noDataRequiredBadges = screen.getAllByText('No Data Required');

    expect(requiresDataBadges.length).toBeGreaterThan(0);
    expect(noDataRequiredBadges.length).toBeGreaterThan(0);
  });

  test('renders the Pending Patches section', () => {
    render(<Home />);
    const sectionHeading = screen.getByText(/Pending Patches/i);
    expect(sectionHeading).toBeInTheDocument();
  });

  test('renders the pending patch', () => {
    render(<Home />);
    const patchTitle = screen.getByText('Remember username');
    expect(patchTitle).toBeInTheDocument();

    const patchDescription = screen.getByText(/The username is not being stored nor remembered/i);
    expect(patchDescription).toBeInTheDocument();
  });
});