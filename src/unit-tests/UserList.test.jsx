import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import UserList from '../components/UserList';

// Mock user data factory
const createMockUser = (overrides = {}) => ({
  login: { uuid: overrides.uuid || 'test-uuid-1' },
  name: { 
    first: overrides.firstName || 'John', 
    last: overrides.lastName || 'Doe' 
  },
  email: overrides.email || 'john.doe@example.com',
  picture: { thumbnail: overrides.thumbnail || 'https://example.com/photo.jpg' },
  location: { 
    city: overrides.city || 'New York', 
    country: overrides.country || 'USA' 
  },
  ...overrides,
});

describe('UserList Component', () => {
  describe('Loading State', () => {
    it('displays a loading message when data is being fetched', () => {
      render(<UserList users={[]} loading={true} error={null} />);
      
      expect(screen.getByText('Loading users...')).toBeInTheDocument();
    });

    it('does not display user list while loading', () => {
      render(<UserList users={[]} loading={true} error={null} />);
      
      expect(screen.queryByRole('list')).not.toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('displays an error message when fetching fails', () => {
      render(<UserList users={[]} loading={false} error="Failed to fetch users" />);
      
      expect(screen.getByText('Error: Failed to fetch users')).toBeInTheDocument();
    });

    it('applies error styling class when an error occurs', () => {
      render(<UserList users={[]} loading={false} error="Network error" />);
      
      const errorContainer = screen.getByText('Error: Network error').closest('div');
      expect(errorContainer).toHaveClass('error');
    });

    it('does not display user list when there is an error', () => {
      render(<UserList users={[]} loading={false} error="Some error" />);
      
      expect(screen.queryByRole('list')).not.toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('displays a helpful message when no users match the filter', () => {
      render(<UserList users={[]} loading={false} error={null} />);
      
      expect(screen.getByText('No users found matching your filter.')).toBeInTheDocument();
    });

    it('does not display an empty list element when there are no users', () => {
      render(<UserList users={[]} loading={false} error={null} />);
      
      expect(screen.queryByRole('list')).not.toBeInTheDocument();
    });
  });

  describe('User Display', () => {
    it('renders a list of users when data is available', () => {
      const users = [
        createMockUser({ uuid: '1', firstName: 'Alice', lastName: 'Smith' }),
        createMockUser({ uuid: '2', firstName: 'Bob', lastName: 'Jones' }),
      ];
      
      render(<UserList users={users} loading={false} error={null} />);
      
      expect(screen.getByRole('list')).toBeInTheDocument();
      expect(screen.getAllByRole('listitem')).toHaveLength(2);
    });

    it('displays the total count of users in the heading', () => {
      const users = [
        createMockUser({ uuid: '1' }),
        createMockUser({ uuid: '2' }),
        createMockUser({ uuid: '3' }),
      ];
      
      render(<UserList users={users} loading={false} error={null} />);
      
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Users (3)');
    });

    it('displays user full name correctly', () => {
      const users = [createMockUser({ firstName: 'Jane', lastName: 'Wilson' })];
      
      render(<UserList users={users} loading={false} error={null} />);
      
      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Jane Wilson');
    });

    it('displays user email address', () => {
      const users = [createMockUser({ email: 'test@domain.com' })];
      
      render(<UserList users={users} loading={false} error={null} />);
      
      expect(screen.getByText('test@domain.com')).toBeInTheDocument();
    });

    it('displays user location with city and country', () => {
      const users = [createMockUser({ city: 'London', country: 'UK' })];
      
      render(<UserList users={users} loading={false} error={null} />);
      
      expect(screen.getByText('London, UK')).toBeInTheDocument();
    });

    it('renders user avatar with correct alt text for accessibility', () => {
      const users = [createMockUser({ firstName: 'Sam', lastName: 'Taylor' })];
      
      render(<UserList users={users} loading={false} error={null} />);
      
      const avatar = screen.getByRole('img');
      expect(avatar).toHaveAttribute('alt', 'Sam Taylor');
    });

    it('renders user avatar with the correct thumbnail URL', () => {
      const users = [createMockUser({ thumbnail: 'https://example.com/avatar.jpg' })];
      
      render(<UserList users={users} loading={false} error={null} />);
      
      const avatar = screen.getByRole('img');
      expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg');
    });
  });

  describe('State Priority', () => {
    it('prioritizes loading state over displaying users', () => {
      const users = [createMockUser()];
      
      render(<UserList users={users} loading={true} error={null} />);
      
      expect(screen.getByText('Loading users...')).toBeInTheDocument();
      expect(screen.queryByRole('list')).not.toBeInTheDocument();
    });

    it('prioritizes error state over displaying users when not loading', () => {
      const users = [createMockUser()];
      
      render(<UserList users={users} loading={false} error="Error occurred" />);
      
      expect(screen.getByText('Error: Error occurred')).toBeInTheDocument();
      expect(screen.queryByRole('list')).not.toBeInTheDocument();
    });
  });
});
