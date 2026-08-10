import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import SortableHeader from '../../components/SortableHeader';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ name: '', email: '', address: '', role: '' });
  const [sortBy, setSortBy] = useState('name');
  const [order, setOrder] = useState('asc');
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users', { params: { ...filters, sortBy, order } });
      setUsers(res.data.users);
    } finally {
      setLoading(false);
    }
  }, [filters, sortBy, order]);

  useEffect(() => {
    const t = setTimeout(fetchUsers, 300);
    return () => clearTimeout(t);
  }, [fetchUsers]);

  const handleSort = (field) => {
    if (sortBy === field) setOrder(order === 'asc' ? 'desc' : 'asc');
    else {
      setSortBy(field);
      setOrder('asc');
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h2>Users</h2>
        <Link to="/admin/users/new" className="btn-link">+ Add User</Link>
      </div>

      <div className="filters">
        <input placeholder="Name" value={filters.name} onChange={(e) => setFilters({ ...filters, name: e.target.value })} />
        <input placeholder="Email" value={filters.email} onChange={(e) => setFilters({ ...filters, email: e.target.value })} />
        <input placeholder="Address" value={filters.address} onChange={(e) => setFilters({ ...filters, address: e.target.value })} />
        <select value={filters.role} onChange={(e) => setFilters({ ...filters, role: e.target.value })}>
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="user">Normal User</option>
          <option value="store_owner">Store Owner</option>
        </select>
      </div>

      {loading ? (
        <p>Loading users...</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <SortableHeader field="name" label="Name" sortBy={sortBy} order={order} onSort={handleSort} />
              <SortableHeader field="email" label="Email" sortBy={sortBy} order={order} onSort={handleSort} />
              <SortableHeader field="address" label="Address" sortBy={sortBy} order={order} onSort={handleSort} />
              <SortableHeader field="role" label="Role" sortBy={sortBy} order={order} onSort={handleSort} />
              <th>Rating</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.address}</td>
                <td>{u.role}</td>
                <td>{u.role === 'store_owner' ? (u.rating ?? 'N/A') : '—'}</td>
                <td><Link to={`/admin/users/${u._id}`}>View</Link></td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={6}>No users found.</td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
