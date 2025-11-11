'use client';

import React, { useState, useEffect } from 'react';
import { Button, Table, Form, Input, Select, DatePicker, message, Spin, Tag, Card } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { Task } from '../../../generated/prisma/client';
import { api } from '../../../lib/api';
import type { ColumnsType } from 'antd/es/table';
import TaskModal from './TaskModal';
import { createColumns, getStatusColor, getStatusText, getPriorityColor, getPriorityText } from './columns';
import { useTaskEditing } from './hooks/useTaskEditing';

const { TextArea } = Input;

// 任务数据类型定义
export interface TaskWithCreator extends Task {
  creator: {
    id: string;
    name: string;
    email: string;
  };
}

const TasksPage: React.FC = () => {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [tasks, setTasks] = useState<TaskWithCreator[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'ascend' | 'descend'>('descend');
  const [filters, setFilters] = useState<{ priorities: string[], statuses: string[], title: string }>({
    priorities: [],
    statuses: [],
    title: ''
  });
  
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
      
      // 构建查询参数
      const params = new URLSearchParams();
      // 只在筛选数组有值时添加优先级参数
      if (filters.priorities.length > 0) {
        filters.priorities.forEach(priority => params.append('priority', priority));
      }
      // 只在筛选数组有值时添加状态参数
      if (filters.statuses.length > 0) {
        filters.statuses.forEach(status => params.append('status', status));
      }
      if (filters.title && filters.title.trim() !== '') {
        params.append('title', filters.title.trim());
      }
      
      const queryString = params.toString();
      const url = queryString ? `/api/tasks?${queryString}` : '/api/tasks';
      
      // 使用安全API请求函数
      const data = await api.get<TaskWithCreator[]>(url);
      setTasks(data || []); // 确保返回空数组而非undefined
    } catch (error) {
      message.error('获取任务列表失败，请稍后重试');
      console.error('获取任务列表错误:', error);
      setTasks([]); // 出错时设置为空数组
    } finally {  
      setLoading(false);
    }
  };

  // 组件加载时获取任务列表
  useEffect(() => {
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

  // 处理排序
  const handleSort = (field: string, order: 'ascend' | 'descend') => {
    setSortField(field);
    setSortOrder(order);
  };

  // 处理筛选
  const handleFilter = (newFilters: { priorities: string[], statuses: string[], title: string }) => {
    setFilters(newFilters);
    // 创建一个新的fetchTasks函数，使用传入的newFilters直接进行筛选
    const fetchTasksWithFilters = async () => {
      try {
        setLoading(true);
        
        // 构建查询参数
        const params = new URLSearchParams();
        // 只在筛选数组有值时添加优先级参数
        if (newFilters.priorities.length > 0) {
          newFilters.priorities.forEach(priority => params.append('priority', priority));
        }
        // 只在筛选数组有值时添加状态参数
        if (newFilters.statuses.length > 0) {
          newFilters.statuses.forEach(status => params.append('status', status));
        }
        if (newFilters.title && newFilters.title.trim() !== '') {
          params.append('title', newFilters.title.trim());
        }
        
        const queryString = params.toString();
        const url = queryString ? `/api/tasks?${queryString}` : '/api/tasks';
        
        // 使用安全API请求函数
        const data = await api.get<TaskWithCreator[]>(url);
        setTasks(data || []); // 确保返回空数组而非undefined
      } catch (error) {
        message.error('获取任务列表失败，请稍后重试');
        console.error('获取任务列表错误:', error);
        setTasks([]); // 出错时设置为空数组
      } finally {  
        setLoading(false);
      }
    };
    fetchTasksWithFilters();
  };

  // 处理选择器变更的通用函数
  const handleSelectChange = (fieldName: string, values: string[]) => {
    // 使用防抖方式更新值，避免循环引用
    setTimeout(() => {
      const currentValues = form.getFieldValue(fieldName) as string[];
      if (!currentValues || JSON.stringify(values) !== JSON.stringify(currentValues)) {
        form.setFieldValue(fieldName, values);
      }
    }, 0);
  };

  const resetFilters = () => {
      form.resetFields();
      // 重置后默认不选择任何选项
    };

  // 前端排序任务列表
  const sortedTasks = React.useMemo(() => {
    if (!tasks || tasks.length === 0) return [];
    
    const tasksToSort = [...tasks];
    if (!sortField || !sortOrder) return tasksToSort;

    return tasksToSort.sort((a, b) => {
      const aField = sortField as keyof TaskWithCreator;
      const bField = sortField as keyof TaskWithCreator;
      
      // 扩展类型以包含creator对象
      let aValue: string | number | Date | null | undefined | { id: string; name: string; email: string; } = a[aField];
      let bValue: string | number | Date | null | undefined | { id: string; name: string; email: string; } = b[bField];

      // 处理日期类型的排序
      if (sortField === 'dueDate' || sortField === 'createdAt') {
        const aDate = aValue ? new Date(String(aValue)) : null;
        const bDate = bValue ? new Date(String(bValue)) : null;
        aValue = aDate && !isNaN(aDate.getTime()) ? aDate.getTime() : 0;
        bValue = bDate && !isNaN(bDate.getTime()) ? bDate.getTime() : 0;
      } else if (typeof aValue !== 'string' && typeof aValue !== 'number') {
        // 对于非字符串和数字类型，转换为字符串进行比较
        aValue = String(aValue ?? '');
        bValue = String(bValue ?? '');
      }

      // 处理null或undefined值
      if (aValue === null || aValue === undefined) {
        return bValue === null || bValue === undefined ? 0 : -1;
      }
      if (bValue === null || bValue === undefined) {
        return 1;
      }

      if (aValue === bValue) return 0;
      
      // 处理不同类型的值比较
      let comparison = 0;
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue > bValue ? 1 : -1;
      } else if (typeof aValue === 'object' && aValue !== null && 'getTime' in aValue && typeof (aValue as Date).getTime === 'function' && 
                 typeof bValue === 'object' && bValue !== null && 'getTime' in bValue && typeof (bValue as Date).getTime === 'function') {
        // 检查是否为日期对象，使用getTime方法存在性检查
        comparison = (aValue as Date).getTime() > (bValue as Date).getTime() ? 1 : -1;
      } else {
        // 对于对象类型（如creator），使用其字符串表示进行比较
        comparison = String(aValue).localeCompare(String(bValue));
      }
      return sortOrder === 'ascend' ? comparison : -comparison;
    });
  }, [tasks, sortField, sortOrder]);

  // 创建表格列，添加编辑和排序功能
  const columns = React.useMemo(() => {
    // 传递编辑函数到createColumns
    const columnConfig = {
      isEditing,
      updateEditingValue
    };
    
    const baseColumns = createColumns(columnConfig);
    
    return baseColumns.map(column => {
      // 确保是普通列而不是列组
      if (!('dataIndex' in column)) {
        return column;
      }
      
      // 为日期列添加排序功能
      const columnWithSort = {
        ...column,
        // 为截止日期和创建日期添加排序功能
        sorter: column.dataIndex && typeof column.dataIndex === 'string' && ['dueDate', 'createdAt'].includes(column.dataIndex) ? {
          compare: (a: TaskWithCreator, b: TaskWithCreator) => {
            const dataIndex = column.dataIndex as keyof TaskWithCreator;
            const aValue = a[dataIndex];
            const bValue = b[dataIndex];
            
            const aTime = aValue ? new Date(String(aValue)).getTime() : 0;
            const bTime = bValue ? new Date(String(bValue)).getTime() : 0;
            
            return aTime - bTime;
          }
        } : undefined,
      };
      
      // 为优先级列添加点击编辑功能
            if (column.dataIndex === 'priority') {
              return {
                ...columnWithSort,
                render: (priority: string, record: TaskWithCreator, index: number) => {
                  if (isEditing(record.id, 'priority')) {
                    // 编辑状态下的渲染
                    return (
                      <Select
                        value={editState.editingValue || priority}
                        onChange={(value) => {
                          updateEditingValue(value);
                          // 确保数据保存后刷新表格
                          // 传递一个新的函数来确保获取最新数据而不依赖当前filters状态
                          saveEdit(record.id, 'priority', value, async () => {
                            await fetchTasks();
                          });
                        }}
                        style={{ width: '100%' }}
                        size="small"
                      >
                        <Select.Option value="low">低</Select.Option>
                        <Select.Option value="medium">中</Select.Option>
                        <Select.Option value="high">高</Select.Option>
                        <Select.Option value="urgent">紧急</Select.Option>
                      </Select>
                    );
                  }
                  // 正常状态下直接渲染Tag组件并添加点击事件
                  // 不再调用column.render以避免状态不一致
                  const getPriorityColor = (p: string): string => {
                    const colorMap: Record<string, string> = {
                      low: 'green',
                      medium: 'blue',
                      high: 'orange',
                      urgent: 'red',
                    };
                    return colorMap[p] || 'default';
                  };
                  
                  const getPriorityText = (p: string): string => {
                    const textMap: Record<string, string> = {
                      low: '低',
                      medium: '中',
                      high: '高',
                      urgent: '紧急',
                    };
                    return textMap[p] || p;
                  };
                  
                  return (
                    <Tag 
                      color={getPriorityColor(priority)} 
                      style={{ cursor: 'pointer' }}
                      onClick={() => startEditing(record.id, 'priority', priority)}
                    >
                      {getPriorityText(priority)}
                    </Tag>
                  );
                }
              };
            }
      
      // 为描述列添加编辑功能
      if (column.dataIndex === 'description') {
        return {
          ...columnWithSort,
          onCell: (record: TaskWithCreator) => ({
            record,
            inputtype: 'textArea' as const,
            dataindex: 'description',
            title: '任务描述',
          }),
          render: (text: string | null | undefined, record: TaskWithCreator, index: number) => {
            if (isEditing(record.id, 'description')) {
              const currentValue = editState.editingValue as string || '';
              return (
                <TextArea
                  value={currentValue}
                  onChange={(e) => updateEditingValue(e.target.value)}
                  onPressEnter={() => saveEdit(record.id, 'description', currentValue, fetchTasks)}
                  onBlur={() => saveEdit(record.id, 'description', currentValue, fetchTasks)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      saveEdit(record.id, 'description', currentValue, fetchTasks);
                    }
                  }}
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
          ...columnWithSort,
          onCell: (record: TaskWithCreator) => ({
            record,
            inputtype: 'select' as const,
            dataindex: 'status',
            title: '状态',
          }),
          render: (status: string, record: TaskWithCreator, index: number) => {
            if (isEditing(record.id, 'status')) {
              const currentValue = editState.editingValue as string;
              return (
                <Select
                  value={currentValue}
                  onChange={(value: string) => {
                    updateEditingValue(value);
                    saveEdit(record.id, 'status', value, fetchTasks);
                  }}
                  style={{ width: '100%' }}
                  size="small"
                >
                  <Select.Option value="pending">待处理</Select.Option>
                  <Select.Option value="in_progress">进行中</Select.Option>
                  <Select.Option value="completed">已完成</Select.Option>
                  <Select.Option value="cancelled">已取消</Select.Option>
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
          ...columnWithSort,
          onCell: (record: TaskWithCreator) => ({
            record,
            inputtype: 'datePicker' as const,
            dataindex: 'dueDate',
            title: '截止日期',
          }),
          render: (date: string | null | undefined, record: TaskWithCreator, index: number) => {
            if (isEditing(record.id, 'dueDate')) {
              const editingDateValue = editState.editingValue as string | Date;
              const dateValue = editingDateValue 
                ? typeof editingDateValue === 'string' 
                  ? new Date(editingDateValue)
                  : editingDateValue
                : undefined;
              
              const validDateValue = dateValue && !isNaN(dateValue.getTime()) ? dayjs(dateValue) : undefined;
              
              return (
                <DatePicker
                  value={validDateValue}
                  onChange={(newDate) => {
                    const dateString = newDate ? newDate.toISOString() : null;
                    updateEditingValue(dateString);
                    // 无论是否有新日期，都调用saveEdit以确保数据同步
                    saveEdit(record.id, 'dueDate', dateString, fetchTasks);
                  }}
                  onBlur={() => {
                    // 失焦时无论是否有更改都退出编辑状态
                    // 如果没有编辑值但原始值存在，使用原始值
                    const valueToSave = editState.editingValue || date;
                    saveEdit(record.id, 'dueDate', valueToSave as string, fetchTasks);
                  }}
                  style={{ width: '100%' }}
                  size="small"
                  minDate={dayjs(record.createdAt)} // 截止日期不能早于创建日期
                  showToday
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
      <div className="flex justify-between items-center mb-6">
        <div className="w-full max-w-3xl">
          <Form
            layout="inline"
            onValuesChange={(changedValues, allValues) => {
              handleFilter({
                priorities: allValues.priorities || [],
                statuses: allValues.statuses || [],
                title: allValues.title || ''
              });
            }}
            form={form}
            initialValues={filters}
            className="mb-4"
          >
            <Form.Item name="title" label="标题">
              <Input placeholder="输入标题搜索" />
            </Form.Item>
            <Form.Item name="priorities" label="优先级" rules={[{ type: 'array' as const }]}>
                <Select 
                  mode="multiple" 
                  placeholder="请选择优先级" 
                  maxTagCount="responsive" 
                  style={{ width: '150px' }}
                  onChange={(values: string[]) => handleSelectChange('priorities', values)}
                >
                  <Select.Option value="" disabled>---请选择---</Select.Option>
                  <Select.Option value="low">低</Select.Option>
                  <Select.Option value="medium">中</Select.Option>
                  <Select.Option value="high">高</Select.Option>
                  <Select.Option value="urgent">紧急</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item name="statuses" label="状态" rules={[{ type: 'array' as const }]}>
                <Select 
                  mode="multiple" 
                  placeholder="请选择状态" 
                  maxTagCount="responsive" 
                  style={{ width: '150px' }}
                  onChange={(values: string[]) => handleSelectChange('statuses', values)}
                >
                  <Select.Option value="" disabled>---请选择---</Select.Option>
                  <Select.Option value="pending">待处理</Select.Option>
                  <Select.Option value="in_progress">进行中</Select.Option>
                  <Select.Option value="completed">已完成</Select.Option>
                  <Select.Option value="cancelled">已取消</Select.Option>
                </Select>
              </Form.Item>
            <Form.Item>
              <Button onClick={resetFilters}>重置</Button>
            </Form.Item>
          </Form>
        </div>
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
          <Spin size="large">
            <div className="relative">
              <span className="absolute inset-0 flex items-center justify-center">加载中...</span>
            </div>
          </Spin>
        </div>
      ) : (
        <Table
          columns={columns as ColumnsType<TaskWithCreator>}
          dataSource={sortedTasks}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 个任务`,
          }}
          onChange={(_pagination, _filters, sorter) => {
            // 处理排序
            if (sorter && typeof sorter === 'object' && 'field' in sorter && sorter.field && sorter.order) {
              handleSort(sorter.field as string, sorter.order as 'ascend' | 'descend');
            }
          }}
          // 默认排序已在初始状态中设置
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