import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
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
  });
});
