import { useState } from 'react';

/**
 * UserList - UI rendering component
 * Responsible for displaying user data in a grid layout
 */
function UserList({ users, loading, error }) {
  const [hoveredUser, setHoveredUser] = useState(null);

  if (loading) {
    return (
      <div className="user-list-status">
        <p>Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-list-status error">
        <p>Error: {error}</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="user-list-status">
        <p>No users found.</p>
      </div>
    );
  }

  return (
    <div className="user-list">
      <h2>Users ({users.length})</h2>
      <div className="user-grid">
        {users.map((user) => (
          <div 
            key={user.login.uuid} 
            className="user-grid-item"
            onMouseEnter={() => setHoveredUser(user.login.uuid)}
            onMouseLeave={() => setHoveredUser(null)}
          >
            <img 
              src={user.picture.large || user.picture.thumbnail} 
              alt={`${user.name.first} ${user.name.last}`}
              className="user-grid-avatar"
            />
            {hoveredUser === user.login.uuid && (
              <div className="user-popover">
                <h3>{user.name.first} {user.name.last}</h3>
                <p className="user-email">{user.email}</p>
                <p className="user-location">
                  {user.location.city}, {user.location.country}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default UserList;
