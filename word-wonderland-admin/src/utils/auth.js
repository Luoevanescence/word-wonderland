/**
 * Token 管理工具
 */

const TOKEN_KEY = 'admin_token';
const USER_KEY = 'admin_user';

/**
 * 保存 token
 */
export const setToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

/**
 * 获取 token
 */
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * 移除 token
 */
export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

/**
 * 保存用户信息
 */
export const setUser = (user) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

/**
 * 获取用户信息
 */
export const getUser = () => {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
};

/**
 * 移除用户信息
 */
export const removeUser = () => {
  localStorage.removeItem(USER_KEY);
};

/**
 * 检查是否已登录
 */
export const isAuthenticated = () => {
  return !!getToken();
};

/**
 * 登出（清除所有认证信息）
 */
export const logout = () => {
  removeToken();
  removeUser();
};

