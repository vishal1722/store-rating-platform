import { useEffect, useState, useCallback } from 'react';
import api from '../../api/axios';
import StarRating from '../../components/StarRating';
import SortableHeader from '../../components/SortableHeader';

export default function StoreList() {
  const [stores, setStores] = useState([]);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [order, setOrder] = useState('asc');
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  const fetchStores = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/user/stores', { params: { name, address, sortBy, order } });
      setStores(res.data.stores);
    } finally {
      setLoading(false);
    }
  }, [name, address, sortBy, order]);

  useEffect(() => {
    const t = setTimeout(fetchStores, 300); // debounce search input
    return () => clearTimeout(t);
  }, [fetchStores]);

  const handleSort = (field) => {
    if (sortBy === field) setOrder(order === 'asc' ? 'desc' : 'asc');
    else {
      setSortBy(field);
      setOrder('asc');
    }
  };

  const submitRating = async (storeId, value) => {
    setSavingId(storeId);
    try {
      await api.post(`/user/stores/${storeId}/rating`, { value });
      setStores((prev) =>
        prev.map((s) => (s._id === storeId ? { ...s, myRating: value } : s))
      );
      fetchStores();
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="page">
      <h2>Browse Stores</h2>
      <div className="filters">
        <input placeholder="Search by name" value={name} onChange={(e) => setName(e.target.value)} />
        <input placeholder="Search by address" value={address} onChange={(e) => setAddress(e.target.value)} />
      </div>

      {loading ? (
        <p>Loading stores...</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <SortableHeader field="name" label="Store Name" sortBy={sortBy} order={order} onSort={handleSort} />
              <SortableHeader field="address" label="Address" sortBy={sortBy} order={order} onSort={handleSort} />
              <th>Overall Rating</th>
              <th>Your Rating</th>
              <th>Rate this store</th>
            </tr>
          </thead>
          <tbody>
            {stores.map((store) => (
              <tr key={store._id}>
                <td>{store.name}</td>
                <td>{store.address}</td>
                <td>{store.overallRating ?? 'No ratings yet'}</td>
                <td>{store.myRating ?? '—'}</td>
                <td>
                  <StarRating
                    value={store.myRating || 0}
                    onChange={(v) => submitRating(store._id, v)}
                    disabled={savingId === store._id}
                  />
                </td>
              </tr>
            ))}
            {stores.length === 0 && (
              <tr>
                <td colSpan={5}>No stores found.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
