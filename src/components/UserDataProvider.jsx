import { useState, useEffect } from 'react';
import UserList from './UserList';

/**
 * UserDataProvider - Data management component
 * Responsible for fetching and managing user data from the API
 */
function UserDataProvider() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('https://randomuser.me/api/?results=10');
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const data = await response.json();
      setUsers(data.results);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users based on search input
  const filteredUsers = users.filter((user) => {
    const fullName = `${user.name.first} ${user.name.last}`.toLowerCase();
    const email = user.email.toLowerCase();
    const searchTerm = filter.toLowerCase();
    
    return fullName.includes(searchTerm) || email.includes(searchTerm);
  });

  return (
    <div className="user-data-provider">
      <div className="controls">
        <input
          type="text"
          placeholder="Filter by name or email..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="filter-input"
        />
        <button onClick={fetchUsers} className="refresh-button">
          Refresh Users
        </button>
      </div>
      
      <UserList 
        users={filteredUsers} 
        loading={loading} 
        error={error} 
      />
    </div>
  );
}

export default UserDataProvider;
