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

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('https://randomuser.me/api/?results=10');
        
        if (!response.ok) {
          throw new Error();
        }
        
        const data = await response.json();
        setUsers(data.results);
      } catch {
        setError('An error occurred while fetching users, please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <UserList 
      users={users} 
      loading={loading} 
      error={error} 
    />
  );
}

export default UserDataProvider;
