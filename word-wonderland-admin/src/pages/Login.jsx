import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { setToken, setUser } from '../utils/auth';
import './Login.css';

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/api/auth/login', formData);
      
      if (response.data.success) {
        // 保存 token 和用户信息
        setToken(response.data.data.token);
        setUser({
          username: response.data.data.username,
          expiresIn: response.data.data.expiresIn
        });

        // 跳转到主页
        navigate('/');
      } else {
        setError(response.data.message || '登录失败');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || '登录失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <img src="/logo.svg" alt="Logo" className="login-logo" />
          <h1>Word Wonderland</h1>
          <p>管理后台</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && (
            <div className="login-error">
              <span> {error}</span>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username">用户名</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              autoComplete="username"
              placeholder="请输入用户名"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">密码</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
              placeholder="请输入密码"
              disabled={loading}
            />
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? '登录中...' : '登录'}
          </button>
        </form>

        <div className="login-footer">
          <p>默认账号：admin / admin123</p>
        </div>
      </div>
    </div>
  );
}

export default Login;

