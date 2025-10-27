import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcrypt';
import prisma from '../../../../lib/prisma';

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

    // 验证密码长度
    if (password.length < 6) {
      return NextResponse.json(
        { error: '密码长度至少为6个字符' },
        { status: 400 }
      );
    }

    // 从数据库查找用户
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, password: true, role: true }
    });

    // 验证用户存在且密码正确
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json(
        { error: '邮箱或密码错误' },
        { status: 401 }
      );
    }

    // 创建会话
    const sessionData = {
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      expires: remember 
        ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7天
        : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 1天
    };

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
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
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