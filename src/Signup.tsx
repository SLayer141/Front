import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface SignupForm {
  username: string;
  password: string;
}

interface SignupErrors {
  username?: string;
  password?: string;
  general?: string;
}

const Signup: React.FC = () => {
  const [form, setForm] = useState<SignupForm>({ username: '', password: '' });
  const [errors, setErrors] = useState<SignupErrors>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validate = (): SignupErrors => {
    const newErrors: SignupErrors = {};
    if (!form.username) newErrors.username = 'Username is required';
    if (!form.password) newErrors.password = 'Password is required';
    return newErrors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length === 0) {
      setLoading(true);
      try {
        const res = await fetch('/api/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (res.ok) {
          navigate('/login');
        } else {
          const data = await res.json();
          setErrors({ general: data.message || 'Signup failed' });
        }
      } catch (err) {
        setErrors({ general: 'Network error' });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Sign Up</h2>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={form.username}
            onChange={handleChange}
            className={errors.username ? 'error' : ''}
          />
          {errors.username && <span className="error-message">{errors.username}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            className={errors.password ? 'error' : ''}
          />
          {errors.password && <span className="error-message">{errors.password}</span>}
        </div>
        {errors.general && <span className="error-message">{errors.general}</span>}
        <button type="submit" disabled={loading}>{loading ? 'Signing up...' : 'Sign Up'}</button>
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
        <span>Already have an account? </span>
        <a href="/login">Login</a>
      </div>
      </form>
    </div>
  );
};

export default Signup; 