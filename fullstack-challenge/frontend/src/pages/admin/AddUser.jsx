import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

export default function AddUser() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', address: '', password: '', role: 'user' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.post('/admin/users', form);
      navigate('/admin/users');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create user.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page">
      <h2>Add User</h2>
      <form className="auth-form inline-form" onSubmit={handleSubmit}>
        {error && <div className="error-banner">{error}</div>}
        <label>Name (20-60 characters)</label>
        <input required minLength={20} maxLength={60} value={form.name} onChange={handleChange('name')} />
        <label>Email</label>
        <input type="email" required value={form.email} onChange={handleChange('email')} />
        <label>Address (max 400 characters)</label>
        <textarea required maxLength={400} value={form.address} onChange={handleChange('address')} />
        <label>Password (8-16 chars, 1 uppercase, 1 special char)</label>
        <input type="password" required minLength={8} maxLength={16} value={form.password} onChange={handleChange('password')} />
        <label>Role</label>
        <select value={form.role} onChange={handleChange('role')}>
          <option value="user">Normal User</option>
          <option value="admin">System Administrator</option>
          <option value="store_owner">Store Owner</option>
        </select>
        <button type="submit" disabled={submitting}>
          {submitting ? 'Creating...' : 'Create User'}
        </button>
      </form>
    </div>
  );
}
