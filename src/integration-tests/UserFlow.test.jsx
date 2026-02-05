import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

// Mock user data that simulates realistic API responses
const createMockUser = (overrides = {}) => ({
  login: { uuid: overrides.uuid || 'test-uuid-1' },
  name: { 
    first: overrides.firstName || 'John', 
    last: overrides.lastName || 'Doe' 
  },
  email: overrides.email || 'john.doe@example.com',
  picture: { thumbnail: 'https://randomuser.me/api/portraits/thumb/men/1.jpg' },
  location: { 
    city: overrides.city || 'New York', 
    country: overrides.country || 'USA' 
  },
});

const createMockApiResponse = (users) => ({
  results: users,
});

describe('User Flow Integration Tests', () => {
  beforeEach(() => {
    vi.spyOn(global, 'fetch');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('When a user visits the application', () => {
    it('should see the application title and description', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(createMockApiResponse([])),
      });

      render(<App />);

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Testing Patterns Demo');
      expect(screen.getByText('A simple app demonstrating component separation patterns')).toBeInTheDocument();
    });

    it('should see a loading indicator while users are being fetched', () => {
      global.fetch.mockImplementation(() => new Promise(() => {}));

      render(<App />);

      expect(screen.getByText('Loading users...')).toBeInTheDocument();
    });

    it('should see a list of users after they are loaded', async () => {
      const mockUsers = [
        createMockUser({ uuid: '1', firstName: 'Emma', lastName: 'Watson', email: 'emma@mail.com', city: 'London', country: 'UK' }),
        createMockUser({ uuid: '2', firstName: 'Chris', lastName: 'Evans', email: 'chris@mail.com', city: 'Boston', country: 'USA' }),
      ];
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(createMockApiResponse(mockUsers)),
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Emma Watson')).toBeInTheDocument();
        expect(screen.getByText('Chris Evans')).toBeInTheDocument();
      });
    });

    it('should see user details including name, email, and location', async () => {
      const mockUsers = [
        createMockUser({ 
          uuid: '1', 
          firstName: 'Sarah', 
          lastName: 'Connor', 
          email: 'sarah.connor@resistance.org', 
          city: 'Los Angeles', 
          country: 'USA' 
        }),
      ];
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(createMockApiResponse(mockUsers)),
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Sarah Connor')).toBeInTheDocument();
        expect(screen.getByText('sarah.connor@resistance.org')).toBeInTheDocument();
        expect(screen.getByText('Los Angeles, USA')).toBeInTheDocument();
      });
    });

    it('should see user avatars with proper accessibility labels', async () => {
      const mockUsers = [
        createMockUser({ uuid: '1', firstName: 'Tony', lastName: 'Stark' }),
      ];
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(createMockApiResponse(mockUsers)),
      });

      render(<App />);

      await waitFor(() => {
        const avatar = screen.getByRole('img', { name: 'Tony Stark' });
        expect(avatar).toBeInTheDocument();
      });
    });
  });

  describe('When a user wants to filter the list', () => {
    it('should see a filter input field with helpful placeholder text', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(createMockApiResponse([])),
      });

      render(<App />);

      expect(screen.getByPlaceholderText('Filter by name or email...')).toBeInTheDocument();
    });

    it('should see only matching users when typing a name in the filter', async () => {
      const user = userEvent.setup();
      const mockUsers = [
        createMockUser({ uuid: '1', firstName: 'Peter', lastName: 'Parker', email: 'peter@daily.com' }),
        createMockUser({ uuid: '2', firstName: 'Mary', lastName: 'Jane', email: 'mj@daily.com' }),
        createMockUser({ uuid: '3', firstName: 'Peter', lastName: 'Quill', email: 'starlord@galaxy.com' }),
      ];
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(createMockApiResponse(mockUsers)),
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Users (3)')).toBeInTheDocument();
      });

      const filterInput = screen.getByPlaceholderText('Filter by name or email...');
      await user.type(filterInput, 'Peter');

      expect(screen.getByText('Users (2)')).toBeInTheDocument();
      expect(screen.getByText('Peter Parker')).toBeInTheDocument();
      expect(screen.getByText('Peter Quill')).toBeInTheDocument();
      expect(screen.queryByText('Mary Jane')).not.toBeInTheDocument();
    });

    it('should see only matching users when typing an email in the filter', async () => {
      const user = userEvent.setup();
      const mockUsers = [
        createMockUser({ uuid: '1', firstName: 'Bruce', lastName: 'Wayne', email: 'batman@wayne.com' }),
        createMockUser({ uuid: '2', firstName: 'Clark', lastName: 'Kent', email: 'superman@dailyplanet.com' }),
      ];
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(createMockApiResponse(mockUsers)),
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Users (2)')).toBeInTheDocument();
      });

      const filterInput = screen.getByPlaceholderText('Filter by name or email...');
      await user.type(filterInput, 'wayne.com');

      expect(screen.getByText('Users (1)')).toBeInTheDocument();
      expect(screen.getByText('Bruce Wayne')).toBeInTheDocument();
      expect(screen.queryByText('Clark Kent')).not.toBeInTheDocument();
    });

    it('should see a helpful message when no users match the filter', async () => {
      const user = userEvent.setup();
      const mockUsers = [
        createMockUser({ uuid: '1', firstName: 'Diana', lastName: 'Prince' }),
      ];
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(createMockApiResponse(mockUsers)),
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Diana Prince')).toBeInTheDocument();
      });

      const filterInput = screen.getByPlaceholderText('Filter by name or email...');
      await user.type(filterInput, 'zzz-no-match-zzz');

      expect(screen.getByText('No users found matching your filter.')).toBeInTheDocument();
    });

    it('should find users regardless of uppercase or lowercase in filter', async () => {
      const user = userEvent.setup();
      const mockUsers = [
        createMockUser({ uuid: '1', firstName: 'Natasha', lastName: 'Romanoff', email: 'blackwidow@shield.gov' }),
      ];
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(createMockApiResponse(mockUsers)),
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Natasha Romanoff')).toBeInTheDocument();
      });

      const filterInput = screen.getByPlaceholderText('Filter by name or email...');
      await user.type(filterInput, 'NATASHA');

      expect(screen.getByText('Natasha Romanoff')).toBeInTheDocument();
    });

    it('should see all users again after clearing the filter', async () => {
      const user = userEvent.setup();
      const mockUsers = [
        createMockUser({ uuid: '1', firstName: 'Steve', lastName: 'Rogers' }),
        createMockUser({ uuid: '2', firstName: 'Bucky', lastName: 'Barnes' }),
      ];
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(createMockApiResponse(mockUsers)),
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Users (2)')).toBeInTheDocument();
      });

      const filterInput = screen.getByPlaceholderText('Filter by name or email...');
      await user.type(filterInput, 'Steve');

      expect(screen.getByText('Users (1)')).toBeInTheDocument();

      await user.clear(filterInput);

      expect(screen.getByText('Users (2)')).toBeInTheDocument();
      expect(screen.getByText('Steve Rogers')).toBeInTheDocument();
      expect(screen.getByText('Bucky Barnes')).toBeInTheDocument();
    });
  });

  describe('When a user wants to refresh the data', () => {
    it('should see a refresh button', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(createMockApiResponse([])),
      });

      render(<App />);

      expect(screen.getByRole('button', { name: 'Refresh Users' })).toBeInTheDocument();
    });

    it('should see new users after clicking the refresh button', async () => {
      const user = userEvent.setup();
      const initialUsers = [
        createMockUser({ uuid: '1', firstName: 'Old', lastName: 'User' }),
      ];
      const refreshedUsers = [
        createMockUser({ uuid: '2', firstName: 'New', lastName: 'User' }),
      ];

      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(createMockApiResponse(initialUsers)),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(createMockApiResponse(refreshedUsers)),
        });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Old User')).toBeInTheDocument();
      });

      const refreshButton = screen.getByRole('button', { name: 'Refresh Users' });
      await user.click(refreshButton);

      await waitFor(() => {
        expect(screen.getByText('New User')).toBeInTheDocument();
      });
      expect(screen.queryByText('Old User')).not.toBeInTheDocument();
    });

    it('should see loading state while data is being refreshed', async () => {
      const user = userEvent.setup();
      const mockUsers = [createMockUser()];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(createMockApiResponse(mockUsers)),
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      global.fetch.mockImplementationOnce(() => new Promise(() => {}));

      const refreshButton = screen.getByRole('button', { name: 'Refresh Users' });
      await user.click(refreshButton);

      expect(screen.getByText('Loading users...')).toBeInTheDocument();
    });
  });

  describe('When an error occurs', () => {
    it('should see an error message when the API fails to load', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Unable to connect'));

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Error: Unable to connect')).toBeInTheDocument();
      });
    });

    it('should see an error message when the server returns an error status', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Error: Failed to fetch users')).toBeInTheDocument();
      });
    });

    it('should be able to recover from an error by clicking refresh', async () => {
      const user = userEvent.setup();

      global.fetch.mockRejectedValueOnce(new Error('Temporary failure'));

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Error: Temporary failure')).toBeInTheDocument();
      });

      const mockUsers = [createMockUser({ firstName: 'Recovered', lastName: 'User' })];
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(createMockApiResponse(mockUsers)),
      });

      const refreshButton = screen.getByRole('button', { name: 'Refresh Users' });
      await user.click(refreshButton);

      await waitFor(() => {
        expect(screen.getByText('Recovered User')).toBeInTheDocument();
      });
      expect(screen.queryByText('Error: Temporary failure')).not.toBeInTheDocument();
    });
  });

  describe('Complete user journey', () => {
    it('should allow a user to load data, filter results, and refresh for new data', async () => {
      const user = userEvent.setup();
      
      // Initial load
      const initialUsers = [
        createMockUser({ uuid: '1', firstName: 'Alice', lastName: 'Anderson', email: 'alice@test.com' }),
        createMockUser({ uuid: '2', firstName: 'Bob', lastName: 'Brown', email: 'bob@test.com' }),
        createMockUser({ uuid: '3', firstName: 'Charlie', lastName: 'Clark', email: 'charlie@test.com' }),
      ];
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(createMockApiResponse(initialUsers)),
      });

      render(<App />);

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Users (3)')).toBeInTheDocument();
      });

      // Filter to show only users with 'B' in name
      const filterInput = screen.getByPlaceholderText('Filter by name or email...');
      await user.type(filterInput, 'Bob');

      expect(screen.getByText('Users (1)')).toBeInTheDocument();
      expect(screen.getByText('Bob Brown')).toBeInTheDocument();

      // Clear filter
      await user.clear(filterInput);
      expect(screen.getByText('Users (3)')).toBeInTheDocument();

      // Refresh with new data
      const refreshedUsers = [
        createMockUser({ uuid: '4', firstName: 'Diana', lastName: 'Davis', email: 'diana@test.com' }),
        createMockUser({ uuid: '5', firstName: 'Edward', lastName: 'Evans', email: 'edward@test.com' }),
      ];
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(createMockApiResponse(refreshedUsers)),
      });

      const refreshButton = screen.getByRole('button', { name: 'Refresh Users' });
      await user.click(refreshButton);

      await waitFor(() => {
        expect(screen.getByText('Users (2)')).toBeInTheDocument();
        expect(screen.getByText('Diana Davis')).toBeInTheDocument();
        expect(screen.getByText('Edward Evans')).toBeInTheDocument();
      });

      // Original users should be gone
      expect(screen.queryByText('Alice Anderson')).not.toBeInTheDocument();
    });
  });
});
