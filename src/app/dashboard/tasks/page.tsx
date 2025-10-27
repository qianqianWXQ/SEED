'use client';

import React, { useState, useEffect } from 'react';
import { Button, Table, Modal, Form, Input, Select, DatePicker, message, Spin, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Task } from '../../../generated/prisma/client';
import { api } from '../../../lib/api';

const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

// 任务数据类型定义
interface TaskWithCreator extends Task {
  creator: {
    id: string;
    name: string;
    email: string;
  };
}

// 表单数据类型定义
interface TaskFormValues {
  title: string;
  description?: string;
  priority: string;
  dueDate?: Date;
}

const TasksPage: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [tasks, setTasks] = useState<TaskWithCreator[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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

  // 隐藏创建任务模态框
  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  // 提交创建任务表单
  const handleSubmit = async (values: TaskFormValues) => {
    try {
      setSubmitting(true);
      
      const taskData = {
        title: values.title,
        description: values.description || undefined,
        priority: values.priority,
        dueDate: values.dueDate ? values.dueDate.toISOString() : undefined,
      };

      // 使用安全API请求函数
      const newTask = await api.post<TaskWithCreator>('/api/tasks', taskData);
      message.success('任务创建成功');
      
      // 更新任务列表
      setTasks(prevTasks => [newTask, ...prevTasks]);
      
      // 关闭模态框并重置表单
      setIsModalVisible(false);
      form.resetFields();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      message.error(errorMessage || '创建任务失败，请稍后重试');
      console.error('创建任务错误:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // 获取优先级标签颜色
  const getPriorityColor = (priority: string) => {
    const colorMap: Record<string, string> = {
      low: 'green',
      medium: 'blue',
      high: 'orange',
      urgent: 'red',
    };
    return colorMap[priority] || 'default';
  };

  // 获取状态标签颜色
  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      pending: 'default',
      'in-progress': 'processing',
      completed: 'success',
    };
    return colorMap[status] || 'default';
  };

  // 表格列定义
  const columns = [
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
      render: (priority: string) => (
        <Tag color={getPriorityColor(priority)}>
          {priority === 'low' && '低'}
          {priority === 'medium' && '中'}
          {priority === 'high' && '高'}
          {priority === 'urgent' && '紧急'}
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status === 'pending' && '待处理'}
          {status === 'in-progress' && '进行中'}
          {status === 'completed' && '已完成'}
        </Tag>
      ),
    },
    {
      title: '截止日期',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date: string) => date ? new Date(date).toLocaleDateString() : '-',
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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">任务管理</h1>
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

      {/* 创建任务模态框 */}
      <Modal
        title="创建新任务"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            priority: 'medium',
          }}
        >
          <Form.Item
            label="任务标题"
            name="title"
            rules={[{ required: true, message: '请输入任务标题' }]}
          >
            <Input placeholder="请输入任务标题" />
          </Form.Item>

          <Form.Item
            label="任务描述"
            name="description"
          >
            <TextArea rows={4} placeholder="请输入任务描述（可选）" />
          </Form.Item>

          <Form.Item
            label="优先级"
            name="priority"
          >
            <Select placeholder="请选择优先级">
              <Option value="low">低</Option>
              <Option value="medium">中</Option>
              <Option value="high">高</Option>
              <Option value="urgent">紧急</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="截止日期"
            name="dueDate"
          >
            <DatePicker 
              placeholder="请选择截止日期（可选）"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={handleCancel}>取消</Button>
            <Button type="primary" htmlType="submit" loading={submitting}>
              创建任务
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default TasksPage;