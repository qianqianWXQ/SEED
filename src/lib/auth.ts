// 移除next/headers依赖，使其在客户端和服务器端都可用

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

// 模拟用户数据
const mockUser: User = {
  id: 'user123',
  name: '模拟用户',
  email: 'user@example.com',
  role: 'user'
};

/**
 * 获取当前登录用户信息
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    // 在客户端环境中返回模拟数据
    // 在实际应用中，您可以使用localStorage或其他客户端存储方式
    return mockUser;
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
  // 在客户端环境中，可以使用localStorage.clear()或其他方式
  console.log('清除用户会话');
}