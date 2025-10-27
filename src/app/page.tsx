import { redirect } from 'next/navigation';
import { isAuthenticated } from '../lib/auth';

export default async function Home() {
  // 检查用户是否已登录
  const authenticated = await isAuthenticated();
  
  // 如果已登录，重定向到仪表盘
  if (authenticated) {
    redirect('/dashboard');
  }
  
  // 否则重定向到登录页面
  redirect('/auth/login');
}
