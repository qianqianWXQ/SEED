import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '../../../lib/prisma';

// 获取当前用户信息
export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('user_session')?.value;

    if (!sessionCookie) {
      return NextResponse.json(
        { error: '未授权' },
        { status: 401 }
      );
    }

    let sessionData;
    try {
      sessionData = JSON.parse(sessionCookie);
    } catch (parseError) {
      return NextResponse.json(
        { error: '无效的会话' },
        { status: 401 }
      );
    }

    // 检查会话是否过期
    if (new Date(sessionData.expires) < new Date()) {
      return NextResponse.json(
        { error: '会话已过期' },
        { status: 401 }
      );
    }

    // 从数据库获取用户信息
    const user = await prisma.user.findUnique({
      where: { id: sessionData.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // 如果用户不存在，返回未授权错误
    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 401 }
      );
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    return NextResponse.json(
      { error: '服务器错误，请稍后再试' },
      { status: 500 }
    );
  }
}