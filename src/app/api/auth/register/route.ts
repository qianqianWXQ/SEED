import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import prisma from '../../../../lib/prisma';

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

    // 检查邮箱是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: '该邮箱已被注册' },
        { status: 400 }
      );
    }

    // 哈希密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'USER' // 默认角色
      },
      select: { id: true, name: true, email: true, role: true }
    });

    return NextResponse.json(
      { 
        message: '注册成功', 
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
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