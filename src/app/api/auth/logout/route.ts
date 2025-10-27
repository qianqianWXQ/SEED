import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();
    
    // 清除会话cookie
    cookieStore.delete('user_session');

    return NextResponse.json(
      { message: '登出成功' },
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