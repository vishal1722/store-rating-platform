import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', address: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register(form);
      navigate('/stores');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Create Account</h2>
        {error && <div className="error-banner">{error}</div>}
        <label>Name (20-60 characters)</label>
        <input required minLength={20} maxLength={60} value={form.name} onChange={handleChange('name')} />
        <label>Email</label>
        <input type="email" required value={form.email} onChange={handleChange('email')} />
        <label>Address (max 400 characters)</label>
        <textarea required maxLength={400} value={form.address} onChange={handleChange('address')} />
        <label>Password (8-16 chars, 1 uppercase, 1 special char)</label>
        <input
          type="password"
          required
          minLength={8}
          maxLength={16}
          value={form.password}
          onChange={handleChange('password')}
        />
        <button type="submit" disabled={submitting}>
          {submitting ? 'Creating account...' : 'Sign Up'}
        </button>
        <p>
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
}
