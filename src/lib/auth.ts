// 用户接口定义
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

/**
 * 获取当前登录用户信息
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    // 客户端环境下，通过API请求获取用户信息
    const response = await fetch('/api/users', {
      credentials: 'include', // 确保发送cookie
    });
    
    if (response.ok) {
      const userData = await response.json();
      return userData;
    }
    
    // 响应失败表示用户未登录或会话过期
    return null;
  } catch (error) {
    console.error('获取当前用户错误:', error);
    return null;
  }
}

/**
 * 验证用户是否已登录
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return !!user;
}

/**
 * 清除用户会话
 */
export async function clearUserSession(): Promise<void> {
  try {
    // 调用登出API
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include', // 确保发送cookie
    });
    
    console.log('用户会话已清除');
  } catch (error) {
    console.error('清除用户会话错误:', error);
  }
}

/**
 * 检查用户是否登录的中间件函数
 * 用于在发起请求前验证用户登录状态
 */
export async function checkAuthAndRedirect() {
  const isAuth = await isAuthenticated();
  if (!isAuth) {
    // 在客户端环境中重定向
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login';
    }
    return false;
  }
  return true;
}