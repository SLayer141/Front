import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import type { JSX } from 'react';
import Login from './Login';
import ProductForm from './ProductForm';
import { AuthProvider, useAuth } from './AuthContext';
import ProductList from './ProductList';
import Signup from './Signup';
import './App.css';

function PrivateRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  return isAuthenticated ? children : <Navigate to="/login" state={{ from: location }} replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/form" element={<PrivateRoute><ProductForm /></PrivateRoute>} />
      <Route path="/form/:id" element={<PrivateRoute><ProductForm /></PrivateRoute>} />
      <Route path="/products" element={<PrivateRoute><ProductList /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/products" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
