/**
 * UserList - UI rendering component
 * Responsible for displaying filtered user data
 */
function UserList({ users, loading, error }) {
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
        <p>No users found matching your filter.</p>
      </div>
    );
  }

  return (
    <div className="user-list">
      <h2>Users ({users.length})</h2>
      <ul>
        {users.map((user) => (
          <li key={user.login.uuid} className="user-card">
            <img 
              src={user.picture.thumbnail} 
              alt={`${user.name.first} ${user.name.last}`}
              className="user-avatar"
            />
            <div className="user-info">
              <h3>{user.name.first} {user.name.last}</h3>
              <p className="user-email">{user.email}</p>
              <p className="user-location">
                {user.location.city}, {user.location.country}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default UserList;
