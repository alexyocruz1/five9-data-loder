import React from 'react';
import { render, screen } from '@testing-library/react';
import Layout from '../Layout';

// Mock the NavbarComponent
jest.mock('../Navbar', () => () => <div>Mocked Navbar</div>);

test('renders layout with children', () => {
  render(<Layout><div>Test Child</div></Layout>);
  expect(screen.getByText('Test Child')).toBeInTheDocument();
});

test('renders NavbarComponent', () => {
  render(<Layout><div>Test Child</div></Layout>);
  expect(screen.getByText('Mocked Navbar')).toBeInTheDocument();
});