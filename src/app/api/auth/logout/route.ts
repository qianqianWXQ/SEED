import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * 登出接口
 * 清除用户会话和认证令牌
 */
export async function POST() {
  try {
    const cookieStore = await cookies();
    
    // 清除会话cookie
    cookieStore.delete('user_session');

    // 返回要求的响应格式
    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('登出错误:', error);
    return NextResponse.json(
      { error: '服务器错误，请稍后再试' },
      { status: 500 }
    );
  }
}