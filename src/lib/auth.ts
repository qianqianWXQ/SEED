import { cookies } from 'next/headers';
// 移除prisma依赖，使用模拟数据

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
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('user_session')?.value;

    if (!sessionCookie) {
      return null;
    }

    let sessionData;
    try {
      sessionData = JSON.parse(sessionCookie);
    } catch (parseError) {
      return null;
    }

    // 检查会话是否过期
    if (new Date(sessionData.expires) < new Date()) {
      // 可选：清除过期的cookie
      const cookieStore = await cookies();
      cookieStore.delete('user_session');
      return null;
    }

    // 模拟从数据库获取用户信息
    // 基于会话中的用户ID返回模拟数据
    const mockUser: User = {
      id: sessionData.userId,
      name: sessionData.name || '模拟用户',
      email: sessionData.email || 'user@example.com',
      role: sessionData.role || 'user'
    };

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
  const cookieStore = await cookies();
  cookieStore.delete('user_session');
}