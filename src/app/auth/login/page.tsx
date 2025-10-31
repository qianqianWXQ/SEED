'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Form, Input, Button, Card, Checkbox, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

export default function LoginPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (values: any) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
        credentials: 'include', // 确保正确存储cookie
      });

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
        className="shadow-lg"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            email: '',
            password: '',
            remember: false,
          }}
        >
          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="your@email.com"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="密码"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="••••••••"
              size="large"
            />
          </Form.Item>

          <Form.Item name="remember" valuePropName="checked">
            <Checkbox>记住我</Checkbox>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              block
              size="large"
              className="font-medium"
            >
              登录
            </Button>
          </Form.Item>
        </Form>

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