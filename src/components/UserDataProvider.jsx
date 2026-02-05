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

  return (
    <div className="user-data-provider">
      <button onClick={fetchUsers} className="refresh-button">
        Refresh Users
      </button>
      
      <UserList 
        users={users} 
        loading={loading} 
        error={error} 
      />
    </div>
  );
}

export default UserDataProvider;
