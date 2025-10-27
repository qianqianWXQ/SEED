import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcrypt';

// 暂时跳过数据库调用，直接返回成功响应

export async function POST(request: Request) {
  try {
    const { email, password, remember } = await request.json();
    const cookieStore = await cookies();

    // 验证请求数据
    if (!email || !password) {
      return NextResponse.json(
        { error: '请提供邮箱和密码' },
        { status: 400 }
      );
    }

    // 验证邮箱格式
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: '请输入有效的邮箱地址' },
        { status: 400 }
      );
    }

    // 模拟验证 - 对于这个示例，我们接受任何非空密码
    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: '密码长度至少为6个字符' },
        { status: 400 }
      );
    }

    // 模拟用户数据
    const mockUser = {
      id: 'mock-id-123',
      email: email,
      name: email.split('@')[0],
      role: 'user'
    };

    // 创建会话
    const sessionData = {
      userId: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        role: mockUser.role,
      expires: remember 
        ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7天
        : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 1天
    };

    // 在实际应用中，这里应该使用更安全的会话管理方式
    // 例如使用JWT或者服务器端会话存储
    
    // 设置会话cookie
    cookieStore.set({
      name: 'user_session',
      value: JSON.stringify(sessionData),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: remember ? 7 * 24 * 60 * 60 : 24 * 60 * 60,
    });

    return NextResponse.json(
      { 
        message: '登录成功', 
        user: {
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
          role: mockUser.role
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('登录错误:', error);
    return NextResponse.json(
      { error: '服务器错误，请稍后再试' },
      { status: 500 }
    );
  }
}