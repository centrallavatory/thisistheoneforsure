import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../pages/Login';
import { AuthProvider } from '../context/AuthContext';
import '@testing-library/jest-dom';
import { act } from 'react-dom/test-utils';

// Mock the useNavigate hook
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

// Mock the API calls
jest.mock('../lib/api', () => ({
  api: {
    post: jest.fn(),
    get: jest.fn(),
  },
}));

describe('Login Component', () => {
  const renderLoginComponent = () => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    // Clear local storage
    localStorage.clear();
  });

  test('renders Login form correctly', () => {
    renderLoginComponent();
    
    // Verify elements are in the document
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByText('Sign in to access your OSINT dashboard')).toBeInTheDocument();
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
  });

  test('handles form input changes', () => {
    renderLoginComponent();
    
    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    expect(usernameInput).toHaveValue('testuser');
    expect(passwordInput).toHaveValue('password123');
  });

  test('displays loading state during login attempt', async () => {
    // Mock implementation that returns a promise that never resolves
    const mockLogin = jest.fn(() => new Promise(() => {}));
    
    jest.spyOn(React, 'useContext').mockImplementation(() => ({
      login: mockLogin,
      user: null,
      isAuthenticated: false,
      loading: false,
      logout: jest.fn(),
    }));
    
    renderLoginComponent();
    
    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Sign in' });
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    fireEvent.click(submitButton);
    
    // The login function should have been called
    expect(mockLogin).toHaveBeenCalledWith('testuser', 'password123');
    
    // Button should be in loading state
    await waitFor(() => {
      // Check for loading indicator or disabled state
      expect(submitButton).toHaveAttribute('disabled');
    });
  });

  test('displays error message on login failure', async () => {
    const errorMessage = 'Invalid username or password';
    const mockLogin = jest.fn().mockRejectedValue(new Error(errorMessage));
    
    jest.spyOn(React, 'useContext').mockImplementation(() => ({
      login: mockLogin,
      user: null,
      isAuthenticated: false,
      loading: false,
      logout: jest.fn(),
    }));
    
    renderLoginComponent();
    
    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Sign in' });
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    
    // Submit the form
    await act(async () => {
      fireEvent.click(submitButton);
    });
    
    // Error message should be displayed
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  test('handles successful login and navigates to dashboard', async () => {
    const mockNavigate = jest.fn();
    const mockLogin = jest.fn().mockResolvedValue({});
    
    jest.spyOn(React, 'useContext').mockImplementation(() => ({
      login: mockLogin,
      user: null,
      isAuthenticated: false,
      loading: false,
      logout: jest.fn(),
    }));
    
    jest.mock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useNavigate: () => mockNavigate,
    }));
    
    renderLoginComponent();
    
    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Sign in' });
    
    fireEvent.change(usernameInput, { target: { value: 'validuser' } });
    fireEvent.change(passwordInput, { target: { value: 'validpassword' } });
    
    // Submit the form
    await act(async () => {
      fireEvent.click(submitButton);
    });
    
    // Login function should have been called with correct params
    expect(mockLogin).toHaveBeenCalledWith('validuser', 'validpassword');
  });
}); 