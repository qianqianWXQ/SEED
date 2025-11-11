import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '../../../lib/prisma';

// 任务创建请求接口定义
interface CreateTaskRequest {
  title: string;
  description?: string;
  priority?: string;
  status?: string;
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

    // 验证状态（如果提供）
    const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled'];
    if (body.status && !validStatuses.includes(body.status)) {
      return NextResponse.json(
        { error: '无效的任务状态' },
        { status: 400 }
      );
    }

    // 创建任务
    const task = await prisma.task.create({
      data: {
        title: body.title,
        description: body.description || '',
        priority: body.priority || 'medium',
        status: (body.status || 'pending') as 'pending' | 'in_progress' | 'completed' | 'cancelled', // 使用具体的类型断言
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
export async function GET(request: Request) {
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

    // 解析查询参数
    const url = new URL(request.url);
    const priorityParams = url.searchParams.getAll('priority');
    const statusParams = url.searchParams.getAll('status');
    const titleParam = url.searchParams.get('title');
    const sortByParam = url.searchParams.get('sortBy');
    const sortOrderParam = url.searchParams.get('sortOrder'); // 'ascend' 或 'descend'
    
    // 构建过滤条件
    const whereClause: Record<string, unknown> = { creatorId: sessionData.userId };
    
    // 添加优先级过滤
    if (priorityParams.length > 0) {
      whereClause.priority = { in: priorityParams };
    }
    
    // 添加状态过滤
    if (statusParams.length > 0) {
      whereClause.status = { in: statusParams };
    }
    
    // 添加标题过滤（模糊匹配）
    if (titleParam && titleParam.trim() !== '') {
      whereClause.title = { contains: titleParam.trim() };
    }

    // 定义状态排序顺序（用于自定义排序）
    const STATUS_SORT_ORDER: Record<string, number> = {
      'pending': 1,
      'in_progress': 2,
      'completed': 3,
      'cancelled': 4
    };

    // 检查是否需要特殊排序（状态列或者默认情况）
    const needsCustomSorting = !sortByParam || sortByParam === 'status' || sortByParam === 'dueDate' || sortByParam === 'createdAt';
    
    // 如果需要特殊排序，先获取所有任务
    if (needsCustomSorting) {
      const tasks = await prisma.task.findMany({
        where: whereClause,
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
      
      // 自定义排序函数
      tasks.sort((a, b) => {
        // 1. 默认排序：按状态规则排序，组内按创建时间排序
        if (!sortByParam) {
          const statusOrderA = STATUS_SORT_ORDER[a.status] || 999;
          const statusOrderB = STATUS_SORT_ORDER[b.status] || 999;
          
          if (statusOrderA !== statusOrderB) {
            return statusOrderA - statusOrderB;
          }
          // 状态相同时，按创建时间降序排序
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        // 2. 按状态排序
        else if (sortByParam === 'status') {
          const statusOrderA = STATUS_SORT_ORDER[a.status] || 999;
          const statusOrderB = STATUS_SORT_ORDER[b.status] || 999;
          
          if (statusOrderA !== statusOrderB) {
            return sortOrderParam === 'ascend' ? statusOrderA - statusOrderB : statusOrderB - statusOrderA;
          }
          // 状态相同时，按创建时间排序
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        // 3. 按截止日期排序
        else if (sortByParam === 'dueDate') {
          // 空值处理：将没有截止日期的任务放在最后
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          
          // 正常日期比较
          const dateA = new Date(a.dueDate).getTime();
          const dateB = new Date(b.dueDate).getTime();
          return sortOrderParam === 'ascend' ? dateA - dateB : dateB - dateA;
        }
        // 4. 按创建日期排序
        else if (sortByParam === 'createdAt') {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return sortOrderParam === 'ascend' ? dateA - dateB : dateB - dateA;
        }
        return 0;
      });
      
      return NextResponse.json(tasks, { status: 200 });
    } else {
      // 其他列使用Prisma的原生排序
      // 直接在findMany中定义排序
      const tasks = await prisma.task.findMany({
        where: whereClause,
        orderBy: [{
          [sortByParam]: sortOrderParam === 'ascend' ? 'asc' : 'desc'
        }],
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
    }


  } catch (error) {
    console.error('获取任务列表错误:', error);
    return NextResponse.json(
      { error: '服务器错误，请稍后再试' },
      { status: 500 }
    );
  }
}

// 删除任务
export async function DELETE(request: Request) {
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

    // 解析URL获取任务ID
    const url = new URL(request.url);
    const taskId = url.pathname.split('/').pop();

    if (!taskId) {
      return NextResponse.json(
        { error: '任务ID不能为空' },
        { status: 400 }
      );
    }

    // 删除任务（向后兼容，不做权限限制）
    const deletedTask = await prisma.task.delete({
      where: { id: taskId },
    });

    return NextResponse.json({ success: true, taskId: deletedTask.id }, { status: 200 });
  } catch (error) {
    console.error('删除任务错误:', error);
    return NextResponse.json(
      { error: '服务器错误，请稍后再试' },
      { status: 500 }
    );
  }
}