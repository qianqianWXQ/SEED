import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';

// 暂时跳过数据库调用，直接返回成功响应
export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    // 验证请求数据
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: '请提供所有必要字段' },
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

    // 验证密码强度
    if (password.length < 8) {
      return NextResponse.json(
        { error: '密码长度至少为8个字符' },
        { status: 400 }
      );
    }

    // 模拟成功响应
    return NextResponse.json(
      { 
        message: '注册成功', 
        user: {
          id: 'mock-id-123',
          name,
          email,
          role: 'user'
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('注册错误:', error);
    return NextResponse.json(
      { error: '服务器错误，请稍后再试' },
      { status: 500 }
    );
  }
}