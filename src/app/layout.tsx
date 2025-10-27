import type { Metadata } from "next";
import "./globals.css";
import React from 'react';

// 创建客户端组件用于主题配置
function ThemeProvider({ children }: { children: React.ReactNode }) {
  'use client';
  
  // 使用动态导入避免服务器组件问题
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
