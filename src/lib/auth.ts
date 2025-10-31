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
 * 优化：在客户端优先检查document.cookie是否存在session信息
 * 避免不必要的API请求，提高性能
 */
export async function isAuthenticated(): Promise<boolean> {
  // 在客户端环境中，先快速检查cookie是否可能存在
  if (typeof window !== 'undefined') {
    // 快速检查是否存在session相关的cookie
    // 注意：登录API设置的cookie名称是'user_session'
    if (!document.cookie.includes('user_session')) {
      return false;
    }
  }
  
  // 然后再通过API确认用户登录状态
  const user = await getCurrentUser();
  return !!user;
}

/**
 * 清除用户会话
 */
export async function clearUserSession(): Promise<void> {
  try {
    console.log('开始清除用户会话');
    // 调用登出API
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include', // 确保发送cookie
    });
    
    if (response.ok) {
      console.log('登出API调用成功');
    } else {
      console.log('登出API返回非成功状态:', response.status);
    }
    
    // 客户端额外清理，确保会话被清除
    if (typeof window !== 'undefined') {
      // 尝试直接从document.cookie中移除session相关cookie
      document.cookie = 'user_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
      console.log('客户端cookie已清理');
    }
    
    console.log('用户会话已清除');
  } catch (error) {
    console.error('清除用户会话错误:', error);
    // 即使API调用失败，也尝试在客户端清理cookie
    if (typeof window !== 'undefined') {
      document.cookie = 'user_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
      console.log('API调用失败，但客户端cookie已清理');
    }
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