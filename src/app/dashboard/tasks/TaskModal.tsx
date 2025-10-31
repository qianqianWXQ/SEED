'use client';

import React from 'react';
import { Modal, Form, Input, Select, DatePicker, Button, message } from 'antd';
import type { TaskWithCreator } from './page';
import { api } from '../../../lib/api';

const { TextArea } = Input;
const { Option } = Select;

// 表单数据类型定义
interface TaskFormValues {
  title: string;
  description?: string;
  priority: string;
  status?: string;
  dueDate?: Date;
}

// TaskModal组件属性
interface TaskModalProps {
  visible: boolean;
  onCancel: () => void;
  onTaskCreated: (task: TaskWithCreator) => void;
}

/**
 * TaskModal组件
 * 用于创建新任务的模态框
 */
const TaskModal: React.FC<TaskModalProps> = ({ visible, onCancel, onTaskCreated }) => {
  const [form] = Form.useForm<TaskFormValues>();
  const [submitting, setSubmitting] = React.useState(false);

  // 提交创建任务表单
  const handleSubmit = async (values: TaskFormValues) => {
    try {
      setSubmitting(true);
      
      const taskData = {
        title: values.title,
        description: values.description || undefined,
        priority: values.priority,
        status: values.status || 'pending',
        dueDate: values.dueDate ? values.dueDate.toISOString() : undefined,
      };

      // 使用安全API请求函数
      const newTask = await api.post<TaskWithCreator>('/api/tasks', taskData);
      message.success('任务创建成功');
      
      // 调用回调函数，将新任务传递给父组件
      onTaskCreated(newTask);
      
      // 关闭模态框并重置表单
      handleCancel();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      message.error(errorMessage || '创建任务失败，请稍后重试');
      console.error('创建任务错误:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // 处理取消
  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title="创建新任务"
      open={visible}
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
          label="状态"
          name="status"
          initialValue="pending"
        >
          <Select placeholder="请选择状态">
            <Option value="pending">待处理</Option>
            <Option value="in_progress">进行中</Option>
            <Option value="completed">已完成</Option>
            <Option value="cancelled">已取消</Option>
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
  );
};

export default TaskModal;