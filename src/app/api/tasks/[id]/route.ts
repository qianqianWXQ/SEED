import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '../../../../lib/prisma';

// 更新任务请求接口定义
interface UpdateTaskRequest {
  description?: string;
  status?: string;
  dueDate?: string;
  priority?: string;
}

// 有效的任务状态列表
const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled'];

// 更新任务（PUT方法 - 完全更新）
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // 在Next.js 16中，params是一个Promise
  const { id } = await params;
  return updateTask(request, id, false);
}

// 部分更新任务（PATCH方法 - 部分更新）
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // 在Next.js 16中，params是一个Promise
  const { id } = await params;
  return updateTask(request, id, true);
}

// 统一的任务更新处理函数
async function updateTask(
  request: Request,
  id: string,
  isPartial: boolean
) {
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

    const taskId = id;
    
    // 验证任务ID是否存在
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!existingTask) {
      return NextResponse.json(
        { error: '任务不存在' },
        { status: 404 }
      );
    }

    // 解析请求体
    const body: UpdateTaskRequest = await request.json();

    // 验证请求数据
    if (body.status && !validStatuses.includes(body.status)) {
      return NextResponse.json(
        { error: '无效的任务状态' },
        { status: 400 }
      );
    }
    
    // 验证描述（如果提供）
    if (body.description !== undefined && typeof body.description !== 'string') {
      return NextResponse.json(
        { error: '描述必须是字符串' },
        { status: 400 }
      );
    }

    // 验证截止日期是否大于创建时间
    if (body.dueDate) {
      const dueDate = new Date(body.dueDate);
      if (dueDate <= existingTask.createdAt) {
        return NextResponse.json(
          { error: '截止日期必须大于任务创建时间' },
          { status: 400 }
        );
      }
    }

    // 更新任务
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        description: body.description,
        status: body.status as 'pending' | 'in_progress' | 'completed' | 'cancelled', // 使用具体的类型断言
        dueDate: body.dueDate ? new Date(body.dueDate) : existingTask.dueDate,
        priority: body.priority,
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

    return NextResponse.json(updatedTask, { status: 200 });
  } catch (error) {
    console.error('更新任务错误:', error);
    return NextResponse.json(
      { error: '服务器错误，请稍后再试' },
      { status: 500 }
    );
  }
}

// 删除任务（DELETE方法）
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const taskId = id;
    
    // 验证任务ID是否存在
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!existingTask) {
      return NextResponse.json(
        { error: '任务不存在' },
        { status: 404 }
      );
    }

    // 删除任务
    await prisma.task.delete({
      where: { id: taskId },
    });

    return NextResponse.json({ message: '任务删除成功' }, { status: 200 });
  } catch (error) {
    console.error('删除任务错误:', error);
    return NextResponse.json(
      { error: '服务器错误，请稍后再试' },
      { status: 500 }
    );
  }
}