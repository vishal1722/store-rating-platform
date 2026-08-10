import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

export default function AddStore() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', address: '', ownerId: '' });
  const [owners, setOwners] = useState([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Only store_owner accounts without a linked store make sense as an owner choice.
    api.get('/admin/users', { params: { role: 'store_owner' } }).then((res) => setOwners(res.data.users));
  }, []);

  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const payload = { ...form, ownerId: form.ownerId || undefined };
      await api.post('/admin/stores', payload);
      navigate('/admin/stores');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create store.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page">
      <h2>Add Store</h2>
      <form className="auth-form inline-form" onSubmit={handleSubmit}>
        {error && <div className="error-banner">{error}</div>}
        <label>Store Name (20-60 characters)</label>
        <input required minLength={20} maxLength={60} value={form.name} onChange={handleChange('name')} />
        <label>Store Email</label>
        <input type="email" required value={form.email} onChange={handleChange('email')} />
        <label>Address (max 400 characters)</label>
        <textarea required maxLength={400} value={form.address} onChange={handleChange('address')} />
        <label>Store Owner (optional)</label>
        <select value={form.ownerId} onChange={handleChange('ownerId')}>
          <option value="">No owner assigned yet</option>
          {owners.map((o) => (
            <option key={o._id} value={o._id}>
              {o.name} ({o.email})
            </option>
          ))}
        </select>
        <button type="submit" disabled={submitting}>
          {submitting ? 'Creating...' : 'Create Store'}
        </button>
      </form>
    </div>
  );
}
