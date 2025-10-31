import { checkAuthAndRedirect } from './auth';

/**
 * 封装的安全API请求函数
 * 自动进行登录检查和cookie传递
 */
export async function secureFetch<T = unknown>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  // 移除请求前的认证检查，只保留响应401时的重定向处理
  // 这样可以避免每次API请求都触发不必要的认证检查

  // 确保包含凭证信息（cookies）
  const fetchOptions: RequestInit = {
    ...options,
    credentials: 'include', // 发送和接收cookies
  };

  // 确保设置了正确的Content-Type
  if (!fetchOptions.headers) {
    fetchOptions.headers = {};
  }
  
  // 如果是JSON请求且没有设置Content-Type，则自动设置
  if (
    fetchOptions.method && 
    ['POST', 'PUT', 'PATCH'].includes(fetchOptions.method) &&
    fetchOptions.body &&
    typeof fetchOptions.body === 'string' &&
    !('Content-Type' in (fetchOptions.headers as Record<string, string>))
  ) {
    (fetchOptions.headers as Record<string, string>)['Content-Type'] = 'application/json';
  }

  // 发起请求
  const response = await fetch(url, fetchOptions);

  // 检查响应状态
  if (!response.ok) {
    // 处理401未授权错误，自动重定向到登录页
    if (response.status === 401) {
      await checkAuthAndRedirect();
      throw new Error('会话已过期，请重新登录');
    }
    
    // 解析错误响应
    let errorMessage = '请求失败';
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
    } catch {
      // 如果无法解析JSON错误，使用HTTP状态文本
      errorMessage = response.statusText || errorMessage;
    }
    
    throw new Error(errorMessage);
  }

  // 解析成功响应
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await response.json();
  }
  
  return await response.text() as T;
}

// 导出便捷方法
export const api = {
  get: <T = unknown>(url: string, options?: RequestInit) => 
    secureFetch<T>(url, { ...options, method: 'GET' }),
  
  post: <T = unknown>(url: string, data?: unknown, options?: RequestInit) => 
    secureFetch<T>(url, { 
      ...options, 
      method: 'POST',
      body: JSON.stringify(data)
    }),
  
  put: <T = unknown>(url: string, data?: unknown, options?: RequestInit) => 
    secureFetch<T>(url, { 
      ...options, 
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  
  delete: <T = unknown>(url: string, options?: RequestInit) => 
    secureFetch<T>(url, { ...options, method: 'DELETE' })
};