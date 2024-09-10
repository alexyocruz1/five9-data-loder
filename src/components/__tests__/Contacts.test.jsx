import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { AppContext } from '../../context/AppContext';
import Contacts from '../Contacts';
import axios from 'axios';
import { transformResponse } from '../../utils';

jest.mock('axios');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  useMediaQuery: jest.fn().mockReturnValue(false),
  useTheme: jest.fn().mockReturnValue({
    breakpoints: {
      up: jest.fn(),
    },
  }),
}));

jest.mock('material-react-table', () => ({
  MaterialReactTable: jest.fn(({ table }) => (
    <div data-testid="material-react-table">
      <table role="table">
        <tbody>
          <tr>
            <td>Mocked Table Content</td>
          </tr>
        </tbody>
      </table>
    </div>
  )),
  useMaterialReactTable: jest.fn(() => ({
    getState: jest.fn(),
    setColumnFilters: jest.fn(),
    setGlobalFilter: jest.fn(),
    setSorting: jest.fn(),
    setColumnVisibility: jest.fn(),
    setDensity: jest.fn(),
  })),
}));

jest.mock('../../utils', () => ({
  transformResponse: jest.fn((response) => {
    const { data } = response;
    const { fields, records } = data.return;
    return records.map(record => {
      const transformedRecord = {};
      fields.forEach((field, index) => {
        transformedRecord[field] = record.values.data[index];
      });
      return transformedRecord;
    });
  })
}));

const mockAppContext = {
  contacts: [],
  setContacts: jest.fn(),
  setUsername: jest.fn(),
  username: '',
  apiRoute: 'http://test-api.com',
};

const renderComponent = (contextOverrides = {}) => {
  render(
    <AppContext.Provider value={{ ...mockAppContext, ...contextOverrides }}>
      <Contacts />
    </AppContext.Provider>
  );
};

const getRefreshButton = () => screen.getByRole('button', { name: /refresh contacts/i });

describe('Contacts Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders Contacts title', () => {
    renderComponent();
    expect(screen.getByText('Contacts')).toBeInTheDocument();
  });

  test('renders refresh button', () => {
    renderComponent();
    const refreshButton = screen.getByRole('button', { 
      name: /refresh/i 
    });
    expect(refreshButton).toBeInTheDocument();
  });

  test('opens login modal when refresh button is clicked', () => {
    renderComponent();
    const refreshButton = screen.getByRole('button', { 
      name: /refresh/i 
    });
    fireEvent.click(refreshButton);
    expect(screen.getByText('Confirm Credentials')).toBeInTheDocument();
  });

  test('renders MaterialReactTable', async () => {
    render(
      <AppContext.Provider value={{ contacts: [{ id: 1, name: 'Test Contact' }], setContacts: jest.fn() }}>
        <Contacts />
      </AppContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('material-react-table')).toBeInTheDocument();
    });

    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  test('fetches contacts when login is successful', async () => {
    const mockApiResponse = {
      data: {
        return: {
          fields: ['id', 'name'],
          records: [
            { values: { data: [1, 'Test Contact'] } }
          ]
        }
      }
    };
    
    axios.post.mockResolvedValueOnce(mockApiResponse);
    
    renderComponent();
    
    const refreshButton = screen.getByRole('button', { name: /refresh contacts/i });
    fireEvent.click(refreshButton);
    
    const usernameInput = screen.getByPlaceholderText(/Enter your username/i);
    const passwordInput = screen.getByPlaceholderText(/Enter your password/i);
    const loginButton = screen.getByRole('button', { name: /Login/i });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password' } });
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://test-api.com/api/contacts/getContactRecordsAll/',
        { username: 'testuser', password: 'password' }
      );
    });

    await waitFor(() => {
      expect(transformResponse).toHaveBeenCalledWith(mockApiResponse);
    });

    expect(mockAppContext.setContacts).toHaveBeenCalledWith([{ id: 1, name: 'Test Contact' }]);

    const successToast = await screen.findByText(/Credentials confirmed and contacts synced!/i);
    expect(successToast).toBeInTheDocument();
  });

  test('shows error toast when login fails', async () => {
    axios.post.mockRejectedValueOnce(new Error('Cannot read properties of undefined (reading \'fields\')'));
    renderComponent();
    
    const refreshButton = getRefreshButton();
    fireEvent.click(refreshButton);
    
    const usernameInput = screen.getByPlaceholderText(/Enter your username/i);
    const passwordInput = screen.getByPlaceholderText(/Enter your password/i);
    const loginButton = screen.getByRole('button', { name: /Login/i });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText('Cannot read properties of undefined (reading \'fields\')')).toBeInTheDocument();
    });
  });
});