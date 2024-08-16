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
    const paragraphElement = screen.getByText(/Available endpoints and their usage can be found below./i);
    expect(paragraphElement).toBeInTheDocument();
  });

  test('renders the table headers', () => {
    render(<Home />);
    const functionHeader = screen.getByText(/Function/i);
    const descriptionHeader = screen.getByText(/Description/i);
    const requiresDataHeader = screen.getByText(/Requires Data/i);

    expect(functionHeader).toBeInTheDocument();
    expect(descriptionHeader).toBeInTheDocument();
    expect(requiresDataHeader).toBeInTheDocument();
  });

  test('renders the table data', () => {
    render(<Home />);
    const functionName = screen.getByText(/Get all contacts/i);
    const functionDescription = screen.getByText(/Fetches all contacts from the database./i);
    const functionRequiresData = screen.getByText(/No/i);

    expect(functionName).toBeInTheDocument();
    expect(functionDescription).toBeInTheDocument();
    expect(functionRequiresData).toBeInTheDocument();
  });
});