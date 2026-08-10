import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const homeByRole = {
    admin: '/admin/dashboard',
    user: '/stores',
    store_owner: '/store-owner/dashboard',
  };

  return (
    <nav className="navbar">
      <Link to={user ? homeByRole[user.role] : '/'} className="brand">
        Store Ratings
      </Link>
      <div className="nav-links">
        {user && (
          <>
            {user.role === 'admin' && (
              <>
                <Link to="/admin/dashboard">Dashboard</Link>
                <Link to="/admin/users">Users</Link>
                <Link to="/admin/stores">Stores</Link>
              </>
            )}
            {user.role === 'user' && (
              <>
                <Link to="/stores">Stores</Link>
                <Link to="/update-password">Update Password</Link>
              </>
            )}
            {user.role === 'store_owner' && (
              <>
                <Link to="/store-owner/dashboard">Dashboard</Link>
                <Link to="/update-password">Update Password</Link>
              </>
            )}
            <span className="user-chip">{user.name} ({user.role})</span>
            <button onClick={handleLogout}>Logout</button>
          </>
        )}
        {!user && (
          <>
            <Link to="/login">Login</Link>
            <Link to="/signup">Sign up</Link>
          </>
        )}
      </div>
    </nav>
  );
}
