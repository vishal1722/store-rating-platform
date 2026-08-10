import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Signup from './pages/Signup';
import UpdatePassword from './pages/UpdatePassword';

import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminStores from './pages/admin/Stores';
import AddUser from './pages/admin/AddUser';
import AddStore from './pages/admin/AddStore';
import UserDetail from './pages/admin/UserDetail';

import StoreList from './pages/user/StoreList';

import StoreOwnerDashboard from './pages/storeOwner/Dashboard';

const homeByRole = {
  admin: '/admin/dashboard',
  user: '/stores',
  store_owner: '/store-owner/dashboard',
};

function Home() {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-loading">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={homeByRole[user.role]} replace />;
}

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/update-password"
            element={
              <ProtectedRoute>
                <UpdatePassword />
              </ProtectedRoute>
            }
          />

          {/* Admin */}
          <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute role="admin"><AdminUsers /></ProtectedRoute>} />
          <Route path="/admin/users/new" element={<ProtectedRoute role="admin"><AddUser /></ProtectedRoute>} />
          <Route path="/admin/users/:id" element={<ProtectedRoute role="admin"><UserDetail /></ProtectedRoute>} />
          <Route path="/admin/stores" element={<ProtectedRoute role="admin"><AdminStores /></ProtectedRoute>} />
          <Route path="/admin/stores/new" element={<ProtectedRoute role="admin"><AddStore /></ProtectedRoute>} />

          {/* Normal user */}
          <Route path="/stores" element={<ProtectedRoute role="user"><StoreList /></ProtectedRoute>} />

          {/* Store owner */}
          <Route path="/store-owner/dashboard" element={<ProtectedRoute role="store_owner"><StoreOwnerDashboard /></ProtectedRoute>} />

          <Route path="*" element={<div className="page">Page not found.</div>} />
        </Routes>
      </main>
    </>
  );
}
