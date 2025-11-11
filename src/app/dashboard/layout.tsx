'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Layout, Menu, Button, message, Modal, ConfigProvider } from 'antd';
import { DashboardOutlined, AppstoreOutlined, SettingOutlined, LogoutOutlined, PieChartOutlined } from '@ant-design/icons';
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

  // 使用useState管理弹窗状态
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  // 登出处理函数 - 移到导航栏中
  const handleLogout = () => {
    // 显示弹窗
    setLogoutModalVisible(true);
  };

  // 确认登出处理
  const confirmLogout = async () => {
    try {
      await clearUserSession();
      message.success('登出成功');
      // 使用window.location进行强制重定向，确保可靠的登出体验
      window.location.href = '/auth/login';
    } catch (error) {
      console.error('登出错误:', error);
      message.error('登出失败，请稍后重试');
      // 即使发生错误，也尝试重定向到登录页面
      window.location.href = '/auth/login';
    } finally {
      // 关闭弹窗
      setLogoutModalVisible(false);
    }
  };

  // 取消登出
  const cancelLogout = () => {
    setLogoutModalVisible(false);
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
      key: 'summary',
      icon: <PieChartOutlined />,
      label: '工作摘要',
      onClick: () => router.push('/dashboard/summary'),
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
            {/* 用户菜单 */}
            <UserMenu user={user} />
            {/* 登出按钮 */}
            <Button 
              danger 
              icon={<LogoutOutlined />} 
              onClick={handleLogout}
              size="small"
            >
              登出
            </Button>
          </div>
        </div>
      </Header>

      <Content style={{ padding: '24px' }}>
        <div className="container mx-auto">
          {children}
        </div>
      </Content>
      
      {/* 登出确认弹窗 - 使用组件方式而非静态方法 */}
      <Modal
        title="确认登出"
        open={logoutModalVisible}
        onOk={confirmLogout}
        onCancel={cancelLogout}
        okText="确定"
        cancelText="取消"
      >
        <p>您确定要退出登录吗？</p>
      </Modal>
    </Layout>
  );
}