'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '../../lib/auth';

interface UserMenuProps {
  user: User;
}

export default function UserMenu({ user }: UserMenuProps) {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // 登出处理函数
  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        // 登出成功，重定向到登录页面
        router.replace('/auth/login');
      } else {
        console.error('登出失败:', data.error || '未知错误');
      }
    } catch (error) {
      console.error('登出请求错误:', error);
    }
  };

  // 切换下拉菜单
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  // 点击其他地方关闭下拉菜单
  React.useEffect(() => {
    const handleClickOutside = () => {
      if (dropdownOpen) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [dropdownOpen]);

  return (
    <div className="relative">
      <button 
        className="flex items-center space-x-2 text-gray-700 hover:text-blue-600"
        onClick={(e) => {
          e.stopPropagation();
          toggleDropdown();
        }}
      >
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <span className="hidden md:inline font-medium">{user.name}</span>
        <svg 
          className={`w-4 h-4 transition-transform ${dropdownOpen ? 'transform rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {/* 用户下拉菜单 */}
      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
          <a 
            href="#" 
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            个人资料
          </a>
          <a 
            href="#" 
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            设置
          </a>
          <div className="border-t border-gray-100 my-1"></div>
          <button 
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
          >
            登出
          </button>
        </div>
      )}
    </div>
  );
}