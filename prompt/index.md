# 任务管理系统 - 总结功能提示词

## 功能概述
本提示词用于指导任务管理系统的自动总结功能，支持按周、月、季度、年四个时间维度生成工作总结报告。总结内容应全面、客观地反映指定时间范围内的任务完成情况、工作效率和项目进展。

## 时间维度定义
- **周总结**：自然周，从周一到周日
- **月总结**：自然月，按日历月份
- **季度总结**：自然季度，每三个月为一个季度
- **年度总结**：自然年，从1月1日到12月31日

## 总结内容结构

### 1. 概览部分
- 时间段明确标识（起止日期）
- 总任务数量统计
- 完成率计算与展示
- 相比上一同期的变化趋势

### 2. 任务完成情况
- 按状态分类统计（待处理、进行中、已完成、已取消）
- 完成任务的平均耗时分析
- 未完成任务的原因分析
- 延期任务的预警提示

### 3. 效率分析
- 各时间段（工作日/周末/不同时段）的工作效率对比
- 任务类型分布与效率关系
- 瓶颈识别与优化建议
- 个人/团队工作节奏分析

### 4. 重点项目进展
- 重要任务的完成质量评估
- 跨时间段任务的进展跟踪
- 里程碑达成情况
- 项目风险点预警

### 5. 改进建议
- 基于数据分析的个性化建议
- 可优化的工作流程
- 资源分配的合理性分析
- 下一阶段的工作重点推荐

## 输入输出格式

### 输入格式
```json
{
  "timeDimension": "week|month|quarter|year",
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD",
  "userId": "string",
  "includeTeamData": boolean,
  "customFilters": {
    "projectIds": ["string"],
    "priorityLevels": ["low|medium|high|urgent"],
    "taskTypes": ["string"]
  }
}
```

### 输出格式
```json
{
  "summary": {
    "period": {
      "start": "YYYY-MM-DD",
      "end": "YYYY-MM-DD",
      "type": "week|month|quarter|year",
      "label": "人类可读的时间段标签"
    },
    "metrics": {
      "totalTasks": number,
      "completedTasks": number,
      "completionRate": number,
      "avgCompletionTime": number,
      "overdueTasks": number
    },
    "trendAnalysis": {
      "completionRateChange": number,
      "taskVolumeChange": number,
      "efficiencyChange": number
    }
  },
  "taskBreakdown": [
    {
      "status": "待处理|进行中|已完成|已取消",
      "count": number,
      "percentage": number,
      "avgPriority": number
    }
  ],
  "efficiencyInsights": [
    {
      "dimension": "string",
      "value": number,
      "insight": "string"
    }
  ],
  "keyProjects": [
    {
      "projectId": "string",
      "projectName": "string",
      "progress": number,
      "status": "string",
      "milestones": [
        {
          "name": "string",
          "completed": boolean,
          "dueDate": "YYYY-MM-DD",
          "actualCompletionDate": "YYYY-MM-DD"
        }
      ]
    }
  ],
  "recommendations": [
    {
      "area": "string",
      "suggestion": "string",
      "potentialImpact": "string"
    }
  ],
  "visualizationData": {
    "taskCompletionTrend": ["array of data points"],
    "priorityDistribution": ["array of data points"],
    "timeSpentByCategory": ["array of data points"]
  }
}
```

## 生成指南
1. **数据准确性**：所有统计数据必须基于系统中的实际任务记录
2. **个性化分析**：根据用户的工作模式提供有针对性的分析
3. **可操作性**：改进建议必须具体、可执行
4. **视觉化支持**：提供适合图表展示的数据结构
5. **简洁明了**：避免冗长的描述，突出关键信息

## 语言要求
总结报告应使用中文编写，语言应专业、客观、易于理解。避免使用过于技术性的术语，确保非技术人员也能理解报告内容。

## 隐私与安全
生成的总结报告应严格遵守数据隐私政策，不得包含敏感信息。团队数据展示必须经过适当的权限验证。

## 页面展示要求
### 组件结构
- 使用Ant Design的Card组件作为每个总结模块的容器
- 使用Statistic组件展示关键指标
- 使用图表组件（如PieChart、BarChart、LineChart）可视化数据
- 使用Tabs组件切换不同时间维度的总结
- 使用Select组件提供过滤选项

### 交互设计
- 时间维度选择器（周/月/季度/年）
- 自定义日期范围选择
- 项目/优先级/任务类型过滤
- 数据导出功能（支持Excel/PDF格式）
- 报告分享功能

### 布局要求
- 响应式设计，适配不同屏幕尺寸
- 关键指标置顶，一目了然
- 图表与文字说明结合展示
- 折叠/展开详情功能

### 视觉风格
- 与TaskFlow系统整体风格保持一致
- 使用系统主色调（蓝色系）作为主题色
- 重要数据突出显示
- 图标与文字结合增强可读性