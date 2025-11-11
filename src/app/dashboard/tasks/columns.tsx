'use client';

import { ColumnsType } from 'antd/es/table';
import { Tag, Select } from 'antd';
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

// 表格列配置接口
interface ColumnConfig {
  isEditing?: (rowKey: string, field: string) => boolean;
  updateEditingValue?: (value: any) => void;
}

// 表格列定义
export const createColumns = (config?: ColumnConfig): ColumnsType<TaskWithCreator> => [
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
    // 为优先级列添加编辑功能的onCell配置
    onCell: (record: TaskWithCreator) => ({
      record,
      dataIndex: 'priority',
      title: '优先级',
    }),
    render: function(priority: string, record: TaskWithCreator, index: number) {
      // 如果正在编辑，显示下拉框
      if (config?.isEditing?.(record.id, 'priority')) {
        return (
          <Select
            value={priority}
            style={{ width: '100%' }}
            onChange={(value) => config?.updateEditingValue?.(value)}
            onClick={(e) => e.stopPropagation()}
            showArrow
            open
          >
            <Select.Option value="low">低</Select.Option>
            <Select.Option value="medium">中</Select.Option>
            <Select.Option value="high">高</Select.Option>
            <Select.Option value="urgent">紧急</Select.Option>
          </Select>
        );
      }
      // 正常显示时使用Ant Design的Tag组件渲染优先级
      return (
        <Tag color={getPriorityColor(priority)} style={{ cursor: 'pointer' }}>
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