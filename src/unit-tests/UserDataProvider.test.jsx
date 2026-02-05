import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import UserDataProvider from '../components/UserDataProvider';

// Mock UserList to isolate UserDataProvider's behavior
vi.mock('../components/UserList', () => ({
  default: vi.fn(({ users, loading, error }) => (
    <div data-testid="user-list-mock">
      <span data-testid="mock-loading">{String(loading)}</span>
      <span data-testid="mock-error">{error || 'null'}</span>
      <span data-testid="mock-users-count">{users.length}</span>
      <span data-testid="mock-users-data">{JSON.stringify(users.map(u => u.login.uuid))}</span>
    </div>
  )),
}));

// Mock user data factory
const createMockUser = (overrides = {}) => ({
  login: { uuid: overrides.uuid || 'test-uuid-1' },
  name: { 
    first: overrides.firstName || 'John', 
    last: overrides.lastName || 'Doe' 
  },
  email: overrides.email || 'john.doe@example.com',
  picture: { thumbnail: 'https://example.com/photo.jpg' },
  location: { city: 'New York', country: 'USA' },
});

const createMockApiResponse = (users) => ({
  results: users,
});

describe('UserDataProvider Component', () => {
  beforeEach(() => {
    vi.spyOn(global, 'fetch');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial Data Fetching', () => {
    it('fetches users from the API when the component mounts', async () => {
      const mockUsers = [createMockUser()];
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(createMockApiResponse(mockUsers)),
      });

      render(<UserDataProvider />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('https://randomuser.me/api/?results=10');
      });
    });

    it('passes loading=true to UserList while fetching data', () => {
      global.fetch.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<UserDataProvider />);

      expect(screen.getByTestId('mock-loading')).toHaveTextContent('true');
    });

    it('passes fetched users to UserList after successful fetch', async () => {
      const mockUsers = [
        createMockUser({ uuid: 'user-1' }),
        createMockUser({ uuid: 'user-2' }),
      ];
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(createMockApiResponse(mockUsers)),
      });

      render(<UserDataProvider />);

      await waitFor(() => {
        expect(screen.getByTestId('mock-loading')).toHaveTextContent('false');
      });
      expect(screen.getByTestId('mock-users-count')).toHaveTextContent('2');
      expect(screen.getByTestId('mock-users-data')).toHaveTextContent('["user-1","user-2"]');
    });

    it('passes loading=false to UserList after fetch completes', async () => {
      const mockUsers = [createMockUser()];
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(createMockApiResponse(mockUsers)),
      });

      render(<UserDataProvider />);

      await waitFor(() => {
        expect(screen.getByTestId('mock-loading')).toHaveTextContent('false');
      });
    });
  });

  describe('Error Handling', () => {
    it('passes error message to UserList when the API request fails', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      render(<UserDataProvider />);

      await waitFor(() => {
        expect(screen.getByTestId('mock-error')).toHaveTextContent('Network error');
      });
    });

    it('passes error message to UserList when the API returns a non-ok response', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      render(<UserDataProvider />);

      await waitFor(() => {
        expect(screen.getByTestId('mock-error')).toHaveTextContent('Failed to fetch users');
      });
    });

    it('passes loading=false to UserList after an error occurs', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      render(<UserDataProvider />);

      await waitFor(() => {
        expect(screen.getByTestId('mock-loading')).toHaveTextContent('false');
      });
    });
  });
});
