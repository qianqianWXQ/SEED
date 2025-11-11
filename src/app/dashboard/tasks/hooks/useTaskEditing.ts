import { useState, useCallback } from 'react';
import { message } from 'antd';
import type { TaskWithCreator } from '../page';
import { api } from '../../../../lib/api';

/**
 * 任务编辑状态类型
 */
interface EditState {
  editingRowKey: string | null;
  editingField: string | null;
  editingValue: string | null | undefined;
  loadingRowKeys: Set<string>;
}

/**
 * 任务编辑钩子
 * 封装表格编辑状态管理和API调用
 */
export const useTaskEditing = () => {
  const [editState, setEditState] = useState<EditState>({
    editingRowKey: null,
    editingField: null,
    editingValue: '',
    loadingRowKeys: new Set(),
  });

  /**
   * 开始编辑
   */
  const startEditing = useCallback((rowKey: string, field: string, initialValue: string | null | undefined) => {
    setEditState(prev => ({
      ...prev,
      editingRowKey: rowKey,
      editingField: field,
      editingValue: initialValue,
    }));
  }, []);

  /**
   * 取消编辑
   */
  const cancelEditing = useCallback(() => {
    setEditState(prev => ({
      ...prev,
      editingRowKey: null,
      editingField: null,
      editingValue: '',
    }));
  }, []);

  /**
   * 更新编辑值
   */
  const updateEditingValue = useCallback((value: string | null | undefined) => {
    setEditState(prev => ({
      ...prev,
      editingValue: value,
    }));
  }, []);

  /**
   * 保存编辑
   * @param taskId 任务ID
   * @param field 字段名
   * @param value 新值
   * @param onSuccess 成功回调
   */
  const saveEdit = useCallback(async (
    taskId: string,
    field: string,
    value: string | null | undefined,
    onSuccess?: () => void
  ) => {
    try {
      // 添加到加载中的行
      setEditState(prev => ({
        ...prev,
      loadingRowKeys: new Set([...prev.loadingRowKeys, taskId]),
    }));

    // 准备更新数据
    const updateData: Record<string, string | null | undefined> = {};
    
    if (field === 'description') {
      updateData.description = value;
    } else if (field === 'status') {
      updateData.status = value;
    } else if (field === 'priority') {
      updateData.priority = value;
    } else if (field === 'dueDate') {
      // 确保类型安全，只对Date对象调用toISOString
      updateData.dueDate = value 
        ? typeof value === 'string' 
          ? value 
          : null
        : null;
    }

      // 调用API更新任务
      await api.patch(`/api/tasks/${taskId}`, updateData);
      message.success('更新成功');
      
      // 重置编辑状态并移除加载状态
      setEditState(prev => {
        const newLoadingRowKeys = new Set(prev.loadingRowKeys);
        newLoadingRowKeys.delete(taskId);
        return {
          editingRowKey: null,
          editingField: null,
          editingValue: '',
          loadingRowKeys: newLoadingRowKeys,
        };
      });

      // 调用成功回调
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      message.error(errorMessage || '更新失败，请稍后重试');
      console.error('更新任务错误:', error);
      
      // 移除加载状态
      setEditState(prev => {
        const newLoadingRowKeys = new Set(prev.loadingRowKeys);
        newLoadingRowKeys.delete(taskId);
        return {
          ...prev,
          loadingRowKeys: newLoadingRowKeys,
        };
      });
    }
  }, []);

  /**
   * 检查是否正在编辑指定行和字段
   */
  const isEditing = useCallback((rowKey: string, field: string): boolean => {
    return editState.editingRowKey === rowKey && editState.editingField === field;
  }, [editState.editingRowKey, editState.editingField]);

  /**
   * 检查是否正在加载
   */
  const isLoading = useCallback((rowKey: string): boolean => {
    return editState.loadingRowKeys.has(rowKey);
  }, [editState.loadingRowKeys]);

  return {
    editState,
    startEditing,
    cancelEditing,
    updateEditingValue,
    saveEdit,
    isEditing,
    isLoading,
  };
};