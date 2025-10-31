'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Form, Input, Button, Card, Checkbox, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

// 预加载Ant Design组件样式，确保页面加载时样式已经可用
const preloadAntdStyles = () => {
  // 强制浏览器优先加载Ant Design样式
  if (typeof document !== 'undefined' && document.head) {
    const links = Array.from(document.head.querySelectorAll('link[rel="stylesheet"]'));
    links.forEach(link => {
      // 添加类型断言，确保TypeScript正确识别link元素类型
      const linkElement = link as HTMLLinkElement;
      if (linkElement.href.includes('antd')) {
        // 触发样式表的加载
        linkElement.onload = () => {
          // 样式加载完成后可以执行额外操作
        };
      }
    });
  }
};

// 立即调用预加载函数
preloadAntdStyles();

export default function LoginPage() {
  // 页面加载时检查URL，如果是直接访问登录页且没有登录，保留在当前页
  useEffect(() => {
    // 这里可以添加额外的客户端登录状态检查逻辑
    // 确保在客户端也能正确处理登录状态
  }, []);
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    // 基本验证
    if (!email || !password) {
      message.error('请填写邮箱和密码');
      return;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      message.error('请输入有效的邮箱地址');
      return;
    }
    
    console.log('准备发送登录请求，邮箱:', email);
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, remember }),
        credentials: 'include',
      });
      
      console.log('登录请求已发送，响应状态:', response.status);

      const data = await response.json();

      if (!response.ok) {
        if (data.error === 'Invalid credentials') {
          message.error('邮箱或密码错误');
        } else {
          message.error(data.error || '登录失败，请稍后再试');
        }
        return;
      }

      // 登录成功，重定向到仪表盘
      router.replace('/dashboard');
    } catch (error) {
      message.error('网络错误，请稍后再试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
      <Card 
        title={<div className="text-center text-2xl font-bold">TaskFlow</div>}
        extra={<p className="text-gray-500">登录您的账号</p>}
        style={{ width: '100%', maxWidth: 400 }}
        className="shadow-lg auth-card"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
            <Input
              prefix={<UserOutlined />}
              placeholder="your@email.com"
              size="large"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="••••••••"
              size="large"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex items-center">
            <Checkbox
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            >
              记住我
            </Checkbox>
          </div>

          <div>
            <Button
              type="primary"
              loading={isLoading}
              block
              size="large"
              className="font-medium"
              onClick={handleSubmit}
            >
              登录
            </Button>
          </div>
        </div>

        <div className="text-center mt-4">
          <p className="text-gray-600">
            没有账号？
            <Link href="/auth/register" className="ml-1 text-blue-600 hover:underline">
              立即注册
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}