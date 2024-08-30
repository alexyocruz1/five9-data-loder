import React from 'react';
import { render, screen, within } from '@testing-library/react';
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

  test('renders the table data', () => {
    render(<Home />);
    
    const rows = screen.getAllByRole('row');
    
    // Check the first row of data
    const firstRow = within(rows[1]);
    const functionName1 = firstRow.getByText(/Get all contacts/i);
    const functionDescription1 = firstRow.getByText(/Fetches all contacts from the database./i);
    const functionRequiresData1 = firstRow.getByText(/No/i);

    expect(functionName1).toBeInTheDocument();
    expect(functionDescription1).toBeInTheDocument();
    expect(functionRequiresData1).toBeInTheDocument();

    // Check the second row of data
    const secondRow = within(rows[2]);
    const functionName2 = secondRow.getByText(/Get users general info/i);
    const functionDescription2 = secondRow.getByText(/Fetches all users general info./i);
    const functionRequiresData2 = secondRow.getByText(/No/i);

    expect(functionName2).toBeInTheDocument();
    expect(functionDescription2).toBeInTheDocument();
    expect(functionRequiresData2).toBeInTheDocument();
  });
});