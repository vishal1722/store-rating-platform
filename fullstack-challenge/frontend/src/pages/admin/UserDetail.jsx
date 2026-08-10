import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';

export default function UserDetail() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/admin/users/${id}`)
      .then((res) => setUser(res.data.user))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="page">Loading...</div>;
  if (!user) return <div className="page">User not found.</div>;

  return (
    <div className="page">
      <Link to="/admin/users">&larr; Back to Users</Link>
      <h2>{user.name}</h2>
      <div className="detail-card">
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Address:</strong> {user.address}</p>
        <p><strong>Role:</strong> {user.role}</p>
        {user.role === 'store_owner' && (
          <>
            <p><strong>Store:</strong> {user.storeName || 'No store linked'}</p>
            <p><strong>Rating:</strong> {user.rating ?? 'N/A'}</p>
          </>
        )}
      </div>
    </div>
  );
}
