import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import SortableHeader from '../../components/SortableHeader';

export default function AdminStores() {
  const [stores, setStores] = useState([]);
  const [filters, setFilters] = useState({ name: '', email: '', address: '' });
  const [sortBy, setSortBy] = useState('name');
  const [order, setOrder] = useState('asc');
  const [loading, setLoading] = useState(true);

  const fetchStores = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/stores', { params: { ...filters, sortBy, order } });
      setStores(res.data.stores);
    } finally {
      setLoading(false);
    }
  }, [filters, sortBy, order]);

  useEffect(() => {
    const t = setTimeout(fetchStores, 300);
    return () => clearTimeout(t);
  }, [fetchStores]);

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
        <h2>Stores</h2>
        <Link to="/admin/stores/new" className="btn-link">+ Add Store</Link>
      </div>

      <div className="filters">
        <input placeholder="Name" value={filters.name} onChange={(e) => setFilters({ ...filters, name: e.target.value })} />
        <input placeholder="Email" value={filters.email} onChange={(e) => setFilters({ ...filters, email: e.target.value })} />
        <input placeholder="Address" value={filters.address} onChange={(e) => setFilters({ ...filters, address: e.target.value })} />
      </div>

      {loading ? (
        <p>Loading stores...</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <SortableHeader field="name" label="Name" sortBy={sortBy} order={order} onSort={handleSort} />
              <SortableHeader field="email" label="Email" sortBy={sortBy} order={order} onSort={handleSort} />
              <SortableHeader field="address" label="Address" sortBy={sortBy} order={order} onSort={handleSort} />
              <th>Rating</th>
            </tr>
          </thead>
          <tbody>
            {stores.map((s) => (
              <tr key={s._id}>
                <td>{s.name}</td>
                <td>{s.email}</td>
                <td>{s.address}</td>
                <td>{s.rating ?? 'No ratings yet'}</td>
              </tr>
            ))}
            {stores.length === 0 && (
              <tr><td colSpan={4}>No stores found.</td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
