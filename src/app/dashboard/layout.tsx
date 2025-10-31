'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Layout, Menu, Button, message } from 'antd';
import { DashboardOutlined, AppstoreOutlined, SettingOutlined, LogoutOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import UserMenu from './UserMenu';
import { type User } from '../../lib/auth';
import { api } from '../../lib/api';
import { clearUserSession } from '../../lib/auth';

const { Header, Content } = Layout;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await api.get<User>('/api/users');
        setUser(userData);
      } catch (error) {
        console.error('获取用户信息错误:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // 登出处理函数 - 移到导航栏中
  const handleLogout = async () => {
    try {
      await clearUserSession();
      message.success('登出成功');
      router.replace('/auth/login');
    } catch (error) {
      message.error('登出失败，请稍后重试');
      console.error('登出错误:', error);
    }
  };

  // 导航菜单项
  const navItems: MenuProps['items'] = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: '仪表盘',
      onClick: () => router.push('/dashboard'),
    },
    {
      key: 'tasks',
      icon: <AppstoreOutlined />,
      label: '任务管理',
      onClick: () => router.push('/dashboard/tasks'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '设置',
      onClick: () => message.info('设置功能即将上线'),
    },
  ];

  if (loading || !user) {
    return <div className="flex items-center justify-center h-screen">加载中...</div>;
  }

  return (
    <Layout className="min-h-screen">
      <Header style={{ padding: 0, backgroundColor: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <div className="container mx-auto px-4 h-full flex items-center">
          {/* TaskFlow标题 */}
          <div className="text-2xl font-bold text-blue-600 mr-8">TaskFlow</div>
          
          {/* 导航菜单 - 调整为紧凑布局 */}
          <Menu 
            mode="horizontal" 
            items={navItems} 
            selectedKeys={[pathname.split('/')[2] || 'dashboard']}
            className="border-none flex-1 overflow-hidden"
            style={{ 
              backgroundColor: 'transparent', 
              marginRight: 'auto',
              flexShrink: 1,
              flexGrow: 1
            }}
          />
          
          {/* 右侧用户相关按钮 */}
          <div className="flex items-center space-x-4">
            {/* 登出按钮 */}
            <Button 
              danger 
              icon={<LogoutOutlined />} 
              onClick={handleLogout}
              size="small"
            >
              登出
            </Button>
            {/* 用户菜单 */}
            <UserMenu user={user} />
          </div>
        </div>
      </Header>

      <Content style={{ padding: '24px' }}>
        <div className="container mx-auto">
          {children}
        </div>
      </Content>
    </Layout>
  );
}