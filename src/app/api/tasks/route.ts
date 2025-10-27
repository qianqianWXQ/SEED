import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '../../../lib/prisma';

// 任务创建请求接口定义
interface CreateTaskRequest {
  title: string;
  description?: string;
  priority?: string;
  dueDate?: string;
}

// 创建任务
export async function POST(request: Request) {
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

    // 解析请求体
    const body: CreateTaskRequest = await request.json();

    // 验证请求数据
    if (!body.title || body.title.trim() === '') {
      return NextResponse.json(
        { error: '任务标题不能为空' },
        { status: 400 }
      );
    }

    // 验证优先级
    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    if (body.priority && !validPriorities.includes(body.priority)) {
      return NextResponse.json(
        { error: '无效的优先级' },
        { status: 400 }
      );
    }

    // 创建任务
    const task = await prisma.task.create({
      data: {
        title: body.title,
        description: body.description || '',
        priority: body.priority || 'medium',
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        creatorId: sessionData.userId,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('创建任务错误:', error);
    return NextResponse.json(
      { error: '服务器错误，请稍后再试' },
      { status: 500 }
    );
  }
}

// 获取任务列表
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

    // 获取用户创建的任务
    const tasks = await prisma.task.findMany({
      where: { creatorId: sessionData.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(tasks, { status: 200 });
  } catch (error) {
    console.error('获取任务列表错误:', error);
    return NextResponse.json(
      { error: '服务器错误，请稍后再试' },
      { status: 500 }
    );
  }
}