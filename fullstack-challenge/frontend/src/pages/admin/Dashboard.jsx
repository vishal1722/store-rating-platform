import { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/admin/dashboard').then((res) => setStats(res.data));
  }, []);

  if (!stats) return <div className="page">Loading...</div>;

  return (
    <div className="page">
      <h2>Admin Dashboard</h2>
      <div className="stat-cards">
        <div className="stat-card">
          <span className="stat-value">{stats.totalUsers}</span>
          <span className="stat-label">Total Users</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.totalStores}</span>
          <span className="stat-label">Total Stores</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.totalRatings}</span>
          <span className="stat-label">Total Ratings Submitted</span>
        </div>
      </div>
    </div>
  );
}
