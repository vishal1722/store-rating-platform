import { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function StoreOwnerDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/store-owner/dashboard')
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page">Loading...</div>;
  if (!data?.store) return <div className="page">No store is currently linked to your account.</div>;

  return (
    <div className="page">
      <h2>{data.store.name}</h2>
      <p className="muted">{data.store.address}</p>

      <div className="stat-cards">
        <div className="stat-card">
          <span className="stat-value">{data.averageRating ?? 'N/A'}</span>
          <span className="stat-label">Average Rating</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{data.raters.length}</span>
          <span className="stat-label">Users Who Rated</span>
        </div>
      </div>

      <h3>Ratings Submitted</h3>
      <table className="data-table">
        <thead>
          <tr>
            <th>User Name</th>
            <th>Email</th>
            <th>Rating</th>
          </tr>
        </thead>
        <tbody>
          {data.raters.map((r, idx) => (
            <tr key={idx}>
              <td>{r.user?.name}</td>
              <td>{r.user?.email}</td>
              <td>{r.value} ★</td>
            </tr>
          ))}
          {data.raters.length === 0 && (
            <tr>
              <td colSpan={3}>No ratings submitted yet.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
