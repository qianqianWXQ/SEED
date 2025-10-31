'use client';

import React from 'react';
import { ConfigProvider } from 'antd';

interface ThemeProviderProps {
  children: React.ReactNode;
}

/**
 * 主题提供器组件
 * 负责配置Ant Design主题并确保React 19兼容性
 */
const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
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
};

export default ThemeProvider;