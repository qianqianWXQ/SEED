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

    // 尝试从数据库获取用户信息
    let user;
    try {
      user = await prisma.user.findUnique({
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
    } catch (dbError) {
      // 数据库错误时，记录但不中断流程
      console.warn('数据库查询失败，使用会话数据:', dbError);
    }

    // 如果数据库中没有找到用户，使用会话中的用户信息
    if (!user) {
      // 从会话数据构建用户对象，添加必要的时间戳
      user = {
        id: sessionData.userId,
        name: sessionData.name,
        email: sessionData.email,
        role: sessionData.role,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
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