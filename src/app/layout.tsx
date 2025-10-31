import type { Metadata } from "next";
// 在Next.js中使用标准的import语法导入CSS
import "./globals.css";
import React from 'react';

// 优化：提前导入antd样式，确保样式加载优先
import 'antd/dist/reset.css';

// 创建客户端组件用于主题配置
function ThemeProvider({ children }: { children: React.ReactNode }) {
  'use client';
  
  // 导入ConfigProvider
  const { ConfigProvider } = require('antd');
  
  // 主题配置
  const theme = {
    token: {
      colorPrimary: '#2563EB',
    },
  };
  
  return (
    <ConfigProvider theme={theme}>
      {children}
    </ConfigProvider>
  );
}

export const metadata: Metadata = {
  title: "TaskFlow - 任务管理平台",
  description: "TaskFlow 是一个高效的任务管理平台，帮助您组织和跟踪工作进度。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
