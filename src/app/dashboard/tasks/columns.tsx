'use client';

import { ColumnsType } from 'antd/es/table';
import { Tag } from 'antd';
import type { TaskWithCreator } from './page';

// 获取优先级标签颜色
export const getPriorityColor = (priority: string): string => {
  const colorMap: Record<string, string> = {
    low: 'green',
    medium: 'blue',
    high: 'orange',
    urgent: 'red',
  };
  return colorMap[priority] || 'default';
};

// 获取优先级显示文本
export const getPriorityText = (priority: string): string => {
  const textMap: Record<string, string> = {
    low: '低',
    medium: '中',
    high: '高',
    urgent: '紧急',
  };
  return textMap[priority] || priority;
};

// 获取状态标签颜色
export const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    pending: 'default',
    in_progress: 'processing',
    completed: 'success',
    cancelled: 'error'
  };
  return colorMap[status] || 'default';
};

// 获取状态显示文本
export const getStatusText = (status: string): string => {
  const textMap: Record<string, string> = {
    pending: '待处理',
    in_progress: '进行中',
    completed: '已完成',
    cancelled: '已取消'
  };
  return textMap[status] || status;
};

// 表格列定义
export const createColumns = (): ColumnsType<TaskWithCreator> => [
  {
    title: '标题',
    dataIndex: 'title',
    key: 'title',
    ellipsis: true,
  },
  {
    title: '描述',
    dataIndex: 'description',
    key: 'description',
    ellipsis: true,
  },
  {
    title: '优先级',
    dataIndex: 'priority',
    key: 'priority',
    render: function(priority: string) {
      // 使用Ant Design的Tag组件渲染优先级
      return (
        <Tag color={getPriorityColor(priority)}>
          {getPriorityText(priority)}
        </Tag>
      );
    },
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    render: function(status: string) {
      // 使用Ant Design的Tag组件渲染状态
      return (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      );
    },
  },
  {
    title: '截止日期',
    dataIndex: 'dueDate',
    key: 'dueDate',
    render: (date: string | null) => date ? new Date(date).toLocaleDateString() : '-',
  },
  {
    title: '创建者',
    dataIndex: ['creator', 'name'],
    key: 'creator',
  },
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    key: 'createdAt',
    render: (date: string) => new Date(date).toLocaleString(),
  },
];