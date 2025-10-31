'use client';

import { useRouter } from 'next/navigation';
import { type User } from '../../lib/auth';
import { api } from '../../lib/api';
import { useState, useEffect } from 'react';
import { Statistic, Card, Button } from 'antd';

export default function DashboardPage() {
  const router = useRouter();

  return (
    <Card className="shadow-sm">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">欢迎回到TaskFlow！</h1>
            <p className="text-gray-600 mb-6">
              这是您的TaskFlow仪表盘。您可以在这里管理您的任务、项目和团队。
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <Statistic 
                  title="总任务数" 
                  value={0} 
                  prefix={<span className="text-blue-600">📋</span>}
                />
                <p className="text-sm text-gray-500 mt-2">点击任务管理开始创建任务</p>
                <Button 
                  type="primary" 
                  className="mt-3 w-full" 
                  onClick={() => router.push('/dashboard/tasks')}
                >
                  前往任务管理
                </Button>
              </Card>
              <Card>
                <Statistic 
                  title="进行中任务" 
                  value={0} 
                  prefix={<span className="text-green-600">🔄</span>}
                />
                <p className="text-sm text-gray-500 mt-2">您的任务进度一目了然</p>
              </Card>
              <Card>
                <Statistic 
                  title="完成率" 
                  value={0} 
                  suffix="%" 
                  prefix={<span className="text-purple-600">✅</span>}
                />
                <p className="text-sm text-gray-500 mt-2">有效管理提高工作效率</p>
              </Card>
            </div>
          </Card>
  );
}