'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Dropdown, Avatar, Button, message } from 'antd';
import { UserOutlined, LogoutOutlined, SettingOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import type { User } from '../../lib/auth';
import { clearUserSession } from '../../lib/auth';

interface UserMenuProps {
  user: User;
}

export default function UserMenu({ user }: UserMenuProps) {
  const router = useRouter();

  // 登出处理函数
  const handleLogout = async () => {
    try {
      // 调用封装的清除会话函数
      await clearUserSession();
      
      // 登出成功，重定向到登录页面
      message.success('登出成功');
      router.replace('/auth/login');
    } catch (error) {
      message.error('登出失败，请稍后重试');
      console.error('登出错误:', error);
    }
  };

  // 菜单项
  const menuItems: MenuProps['items'] = [
    {
      key: 'profile',
      label: `您好，${user.name}`,
      disabled: true,
      icon: <UserOutlined />,
    },
    {
      key: 'settings',
      label: '设置',
      icon: <SettingOutlined />,
      onClick: () => message.info('设置功能即将上线'),
    },
    {
      key: 'logout',
      label: '登出',
      danger: true,
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ];

  return (
    <Dropdown menu={{ items: menuItems }} trigger={['click']}>
      <Button 
        type="text" 
        className="flex items-center"
      >
        <Avatar icon={<UserOutlined />} className="mr-2" />
        {user.name}
      </Button>
    </Dropdown>
  );
}