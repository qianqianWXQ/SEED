import { redirect } from 'next/navigation';
import { getCurrentUser } from '../../lib/auth';

export default async function DashboardPage() {
  // 获取当前登录用户信息
  const user = await getCurrentUser();

  // 如果用户未登录，重定向到登录页面
  if (!user) {
    redirect('/auth/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 导航栏 */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-2xl font-bold text-blue-600">TaskFlow</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <a href="/dashboard" className="text-blue-600 font-medium">仪表盘</a>
            <a href="#" className="text-gray-600 hover:text-blue-600">设置</a>
          </nav>
          <div className="relative">
            <button className="flex items-center space-x-2 text-gray-700 hover:text-blue-600">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="hidden md:inline font-medium">{user.name}</span>
            </button>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">欢迎回来，{user.name}！</h1>
          <p className="text-gray-600 mb-6">
            这是您的TaskFlow仪表盘。您可以在这里管理您的任务、项目和团队。
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">总任务数</h3>
              <p className="text-3xl font-bold text-blue-600">0</p>
              <p className="text-sm text-gray-500 mt-2">任务管理功能即将上线</p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">进行中任务</h3>
              <p className="text-3xl font-bold text-green-600">0</p>
              <p className="text-sm text-gray-500 mt-2">开始创建您的第一个任务</p>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">完成率</h3>
              <p className="text-3xl font-bold text-purple-600">0%</p>
              <p className="text-sm text-gray-500 mt-2">追踪您的任务完成情况</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}