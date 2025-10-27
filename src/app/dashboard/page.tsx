'use client';

import { redirect } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { getCurrentUser, type User } from '../../lib/auth';
import UserMenu from './UserMenu';
import { useState, useEffect } from 'react';
import { Layout, Menu, Statistic, Card, Spin } from 'antd';
import { DashboardOutlined, SettingOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';

const { Header, Content } = Layout;

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getCurrentUser();
        if (!userData) {
          redirect('/auth/login');
        } else {
          setUser(userData);
        }
      } catch (error) {
        redirect('/auth/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading || !user) {
    return <div className="flex items-center justify-center h-screen">加载中...</div>;
  }

  const router = useRouter();
  // 所有客户端交互逻辑已移至UserMenu组件

  // 导航菜单项
  const navItems: MenuProps['items'] = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: '仪表盘',
      onClick: () => router.push('/dashboard'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '设置',
      onClick: () => {},
    },
  ];

  return (
    <Layout className="min-h-screen">
      <Header style={{ padding: 0, backgroundColor: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <div className="container mx-auto px-4 h-full flex items-center justify-between">
          <div className="text-2xl font-bold text-blue-600">TaskFlow</div>
          <Menu 
            mode="horizontal" 
            items={navItems} 
            selectedKeys={['dashboard']}
            className="border-none"
            style={{ backgroundColor: 'transparent' }}
          />
          <UserMenu user={user} />
        </div>
      </Header>

      <Content style={{ padding: '24px' }}>
        <div className="container mx-auto">
          <Card className="shadow-sm">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">欢迎回来，{user.name}！</h1>
            <p className="text-gray-600 mb-6">
              这是您的TaskFlow仪表盘。您可以在这里管理您的任务、项目和团队。
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <Statistic 
                  title="总任务数" 
                  value={0} 
                  prefix={<span className="text-blue-600">📋</span>}
                />
                <p className="text-sm text-gray-500 mt-2">任务管理功能即将上线</p>
              </Card>
              <Card>
                <Statistic 
                  title="进行中任务" 
                  value={0} 
                  prefix={<span className="text-green-600">🔄</span>}
                />
                <p className="text-sm text-gray-500 mt-2">开始创建您的第一个任务</p>
              </Card>
              <Card>
                <Statistic 
                  title="完成率" 
                  value={0} 
                  suffix="%" 
                  prefix={<span className="text-purple-600">✅</span>}
                />
                <p className="text-sm text-gray-500 mt-2">追踪您的任务完成情况</p>
              </Card>
            </div>
          </Card>
        </div>
      </Content>
    </Layout>
  );
}