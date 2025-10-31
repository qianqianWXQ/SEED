import type { Metadata } from "next";
// 在Next.js中使用标准的import语法导入CSS
import "./globals.css";

// 导入Ant Design官方React 19兼容包
// 注意：这个包会自动在全局范围内应用兼容性补丁
import '@ant-design/v5-patch-for-react-19';

// 优化：提前导入antd样式，确保样式加载优先
import 'antd/dist/reset.css';

// 导入客户端主题提供器组件
import ThemeProvider from './ThemeProvider'; // 确保ThemeProvider组件在正确的路径

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
