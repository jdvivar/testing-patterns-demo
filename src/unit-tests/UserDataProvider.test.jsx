import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

  describe('Filter Input', () => {
    it('renders a filter input field with placeholder text', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(createMockApiResponse([])),
      });

      render(<UserDataProvider />);

      expect(screen.getByPlaceholderText('Filter by name or email...')).toBeInTheDocument();
    });

    it('passes only users matching first name filter to UserList', async () => {
      const user = userEvent.setup();
      const mockUsers = [
        createMockUser({ uuid: 'alice-1', firstName: 'Alice', lastName: 'Smith', email: 'alice@test.com' }),
        createMockUser({ uuid: 'bob-1', firstName: 'Bob', lastName: 'Jones', email: 'bob@test.com' }),
      ];
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(createMockApiResponse(mockUsers)),
      });

      render(<UserDataProvider />);

      await waitFor(() => {
        expect(screen.getByTestId('mock-users-count')).toHaveTextContent('2');
      });

      const filterInput = screen.getByPlaceholderText('Filter by name or email...');
      await user.type(filterInput, 'Alice');

      expect(screen.getByTestId('mock-users-count')).toHaveTextContent('1');
      expect(screen.getByTestId('mock-users-data')).toHaveTextContent('["alice-1"]');
    });

    it('passes only users matching last name filter to UserList', async () => {
      const user = userEvent.setup();
      const mockUsers = [
        createMockUser({ uuid: 'alice-1', firstName: 'Alice', lastName: 'Smith', email: 'alice@test.com' }),
        createMockUser({ uuid: 'bob-1', firstName: 'Bob', lastName: 'Jones', email: 'bob@test.com' }),
      ];
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(createMockApiResponse(mockUsers)),
      });

      render(<UserDataProvider />);

      await waitFor(() => {
        expect(screen.getByTestId('mock-users-count')).toHaveTextContent('2');
      });

      const filterInput = screen.getByPlaceholderText('Filter by name or email...');
      await user.type(filterInput, 'Jones');

      expect(screen.getByTestId('mock-users-count')).toHaveTextContent('1');
      expect(screen.getByTestId('mock-users-data')).toHaveTextContent('["bob-1"]');
    });

    it('passes only users matching email filter to UserList', async () => {
      const user = userEvent.setup();
      const mockUsers = [
        createMockUser({ uuid: 'alice-1', firstName: 'Alice', lastName: 'Smith', email: 'alice@company.com' }),
        createMockUser({ uuid: 'bob-1', firstName: 'Bob', lastName: 'Jones', email: 'bob@different.org' }),
      ];
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(createMockApiResponse(mockUsers)),
      });

      render(<UserDataProvider />);

      await waitFor(() => {
        expect(screen.getByTestId('mock-users-count')).toHaveTextContent('2');
      });

      const filterInput = screen.getByPlaceholderText('Filter by name or email...');
      await user.type(filterInput, 'company.com');

      expect(screen.getByTestId('mock-users-count')).toHaveTextContent('1');
      expect(screen.getByTestId('mock-users-data')).toHaveTextContent('["alice-1"]');
    });

    it('performs case-insensitive filtering when passing users to UserList', async () => {
      const user = userEvent.setup();
      const mockUsers = [
        createMockUser({ uuid: 'alice-1', firstName: 'Alice', lastName: 'Smith', email: 'alice@test.com' }),
      ];
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(createMockApiResponse(mockUsers)),
      });

      render(<UserDataProvider />);

      await waitFor(() => {
        expect(screen.getByTestId('mock-users-count')).toHaveTextContent('1');
      });

      const filterInput = screen.getByPlaceholderText('Filter by name or email...');
      await user.type(filterInput, 'ALICE');

      expect(screen.getByTestId('mock-users-count')).toHaveTextContent('1');
      expect(screen.getByTestId('mock-users-data')).toHaveTextContent('["alice-1"]');
    });

    it('passes empty array to UserList when filter matches no users', async () => {
      const user = userEvent.setup();
      const mockUsers = [
        createMockUser({ uuid: 'alice-1', firstName: 'Alice', lastName: 'Smith' }),
      ];
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(createMockApiResponse(mockUsers)),
      });

      render(<UserDataProvider />);

      await waitFor(() => {
        expect(screen.getByTestId('mock-users-count')).toHaveTextContent('1');
      });

      const filterInput = screen.getByPlaceholderText('Filter by name or email...');
      await user.type(filterInput, 'xyz-no-match');

      expect(screen.getByTestId('mock-users-count')).toHaveTextContent('0');
      expect(screen.getByTestId('mock-users-data')).toHaveTextContent('[]');
    });
  });

  describe('Refresh Functionality', () => {
    it('renders a refresh button', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(createMockApiResponse([])),
      });

      render(<UserDataProvider />);

      expect(screen.getByRole('button', { name: 'Refresh Users' })).toBeInTheDocument();
    });

    it('calls the API again when the refresh button is clicked', async () => {
      const user = userEvent.setup();
      const mockUsers = [createMockUser()];

      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(createMockApiResponse(mockUsers)),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(createMockApiResponse(mockUsers)),
        });

      render(<UserDataProvider />);

      await waitFor(() => {
        expect(screen.getByTestId('mock-loading')).toHaveTextContent('false');
      });

      const refreshButton = screen.getByRole('button', { name: 'Refresh Users' });
      await user.click(refreshButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2);
      });
    });

    it('passes new users to UserList after refresh', async () => {
      const user = userEvent.setup();
      const initialUsers = [createMockUser({ uuid: 'initial-1' })];
      const refreshedUsers = [createMockUser({ uuid: 'refreshed-1' }), createMockUser({ uuid: 'refreshed-2' })];

      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(createMockApiResponse(initialUsers)),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(createMockApiResponse(refreshedUsers)),
        });

      render(<UserDataProvider />);

      await waitFor(() => {
        expect(screen.getByTestId('mock-users-data')).toHaveTextContent('["initial-1"]');
      });

      const refreshButton = screen.getByRole('button', { name: 'Refresh Users' });
      await user.click(refreshButton);

      await waitFor(() => {
        expect(screen.getByTestId('mock-users-data')).toHaveTextContent('["refreshed-1","refreshed-2"]');
      });
    });

    it('passes loading=true to UserList while refreshing', async () => {
      const user = userEvent.setup();
      const mockUsers = [createMockUser()];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(createMockApiResponse(mockUsers)),
      });

      render(<UserDataProvider />);

      await waitFor(() => {
        expect(screen.getByTestId('mock-loading')).toHaveTextContent('false');
      });

      // Mock a slow fetch for refresh
      global.fetch.mockImplementationOnce(() => new Promise(() => {}));

      const refreshButton = screen.getByRole('button', { name: 'Refresh Users' });
      await user.click(refreshButton);

      expect(screen.getByTestId('mock-loading')).toHaveTextContent('true');
    });

    it('clears error and passes null to UserList when refreshing successfully after an error', async () => {
      const user = userEvent.setup();

      // First fetch fails
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      render(<UserDataProvider />);

      await waitFor(() => {
        expect(screen.getByTestId('mock-error')).toHaveTextContent('Network error');
      });

      // Second fetch succeeds
      const mockUsers = [createMockUser({ uuid: 'success-1' })];
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(createMockApiResponse(mockUsers)),
      });

      const refreshButton = screen.getByRole('button', { name: 'Refresh Users' });
      await user.click(refreshButton);

      await waitFor(() => {
        expect(screen.getByTestId('mock-error')).toHaveTextContent('null');
        expect(screen.getByTestId('mock-users-data')).toHaveTextContent('["success-1"]');
      });
    });
  });
});
