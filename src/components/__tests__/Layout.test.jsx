import React from 'react';
import { render, screen } from '@testing-library/react';
import Layout from '../Layout';

jest.mock('../Navbar', () => () => <div data-testid="mock-navbar">Mocked Navbar</div>);

describe('Layout Component', () => {
  test('renders NavbarComponent and children', () => {
    render(
      <Layout>
        <div data-testid="child-content">Test Child Content</div>
      </Layout>
    );

    expect(screen.getByTestId('mock-navbar')).toBeInTheDocument();
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
  });
});