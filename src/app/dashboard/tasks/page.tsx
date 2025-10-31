'use client';

import React, { useState, useEffect } from 'react';
import { Button, Table, Form, Input, Select, DatePicker, message, Spin, Tag, Card } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { Task } from '../../../generated/prisma/client';
import { api } from '../../../lib/api';
import TaskModal from './TaskModal';
import { createColumns, getStatusColor, getStatusText } from './columns'; // 已重命名为.tsx扩展名，Next.js会自动处理
import { useTaskEditing } from './hooks/useTaskEditing';

const { TextArea } = Input;
const { Option } = Select;

// 任务数据类型定义
export interface TaskWithCreator extends Task {
  creator: {
    id: string;
    name: string;
    email: string;
  };
}

const TasksPage: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [tasks, setTasks] = useState<TaskWithCreator[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 使用任务编辑钩子
  const {
    editState,
    startEditing,
    cancelEditing,
    updateEditingValue,
    saveEdit,
    isEditing,
    isLoading
  } = useTaskEditing();

  // 获取任务列表
  const fetchTasks = async () => {
    try {
      setLoading(true);
      // 使用安全API请求函数
      const data = await api.get<TaskWithCreator[]>('/api/tasks');
      setTasks(data);
    } catch (error) {
      message.error('获取任务列表失败，请稍后重试');
      console.error('获取任务列表错误:', error);
    } finally {
      setLoading(false);
    }
  };

  // 组件加载时获取任务列表
  useEffect(() => {
    // api.get 会自动处理登录检查
    fetchTasks();
  }, []);

  // 显示创建任务模态框
  const showModal = () => {
    setIsModalVisible(true);
  };

  // 处理任务创建成功
  const handleTaskCreated = (newTask: TaskWithCreator) => {
    // 更新任务列表
    setTasks(prevTasks => [newTask, ...prevTasks]);
    // 关闭模态框
    setIsModalVisible(false);
  };

  // 创建表格列，添加编辑功能
  const columns = React.useMemo(() => {
    const baseColumns = createColumns();
    
    return baseColumns.map(column => {
      // 确保是普通列而不是列组
      if (!('dataIndex' in column)) {
        return column;
      }
      
      // 为描述列添加编辑功能
      if (column.dataIndex === 'description') {
        return {
          ...column,
          onCell: (record: TaskWithCreator) => ({
            record,
            inputType: 'textArea',
            dataIndex: 'description',
            title: '描述',
          }),
          render: (text: string, record: TaskWithCreator) => {
            if (isEditing(record.id, 'description')) {
              return (
                <TextArea
                  value={editState.editingValue}
                  onChange={(e) => updateEditingValue(e.target.value)}
                  onPressEnter={() => saveEdit(record.id, 'description', editState.editingValue, fetchTasks)}
                  onBlur={() => saveEdit(record.id, 'description', editState.editingValue, fetchTasks)}
                  autoSize={{ minRows: 1, maxRows: 3 }}
                  placeholder="请输入描述"
                />
              );
            }
            return <div style={{ cursor: 'pointer' }} onClick={() => startEditing(record.id, 'description', text || '')}>
              {text || <span className="text-gray-400">点击编辑描述</span>}
            </div>;
          },
        };
      }
      
      // 为状态列添加编辑功能
      else if (column.dataIndex === 'status') {
        return {
          ...column,
          onCell: (record: TaskWithCreator) => ({
            record,
            inputType: 'select',
            dataIndex: 'status',
            title: '状态',
          }),
          render: (status: string, record: TaskWithCreator) => {
            if (isEditing(record.id, 'status')) {
              return (
                <Select
                    value={editState.editingValue}
                    onChange={(value) => {
                      updateEditingValue(value);
                      saveEdit(record.id, 'status', value, fetchTasks);
                    }}
                    style={{ width: '100%' }}
                    size="small"
                  >
                    <Option value="pending">待处理</Option>
                    <Option value="in_progress">进行中</Option>
                    <Option value="completed">已完成</Option>
                    <Option value="cancelled">已取消</Option>
                  </Select>
              );
            }
            return (
              <Tag
                color={getStatusColor(status)}
                style={{ cursor: 'pointer' }}
                onClick={() => startEditing(record.id, 'status', status)}
              >
                {getStatusText(status)}
              </Tag>
            );
          },
        };
      }
      
      // 为截止日期列添加编辑功能
      else if (column.dataIndex === 'dueDate') {
        return {
          ...column,
          onCell: (record: TaskWithCreator) => ({
            record,
            inputType: 'datePicker',
            dataIndex: 'dueDate',
            title: '截止日期',
          }),
          render: (date: string | null, record: TaskWithCreator) => {
            if (isEditing(record.id, 'dueDate')) {
              return (
                <DatePicker
                  value={editState.editingValue ? new Date(editState.editingValue) : undefined}
                  onChange={(date) => {
                    updateEditingValue(date);
                    if (date) {
                      saveEdit(record.id, 'dueDate', date, fetchTasks);
                    }
                  }}
                  style={{ width: '100%' }}
                  size="small"
                  minDate={dayjs(record.createdAt)} // 截止日期不能早于创建日期
                />
              );
            }
            return (
              <div style={{ cursor: 'pointer' }} onClick={() => startEditing(record.id, 'dueDate', date || undefined)}>
                {date ? new Date(date).toLocaleDateString() : <span className="text-gray-400">点击设置日期</span>}
              </div>
            );
          },
        };
      }
      
      return column;
    });
  }, [editState, isEditing, startEditing, updateEditingValue, saveEdit, fetchTasks]);

  return (
    <Card className="shadow-sm p-6">
      <div className="flex justify-end items-center mb-6">
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={showModal}
        >
          新建任务
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" tip="加载中..." />
        </div>
      ) : (
        <Table
          columns={columns}
          dataSource={tasks}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 个任务`,
          }}
        />
      )}

      {/* 使用抽离的TaskModal组件 */}
      <TaskModal
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onTaskCreated={handleTaskCreated}
      />
    </Card>
  );
};

export default TasksPage;