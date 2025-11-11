'use client';

import React, { useState, useEffect } from 'react';
import { Card, Tabs, Select, DatePicker, Button, Row, Col, Statistic, Spin, Empty, Space, message, Tooltip } from 'antd';
import { ExportOutlined, ShareAltOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, LineChart, Line, ResponsiveContainer } from 'recharts';
import dayjs, { Dayjs } from 'dayjs';
import type { TabsProps } from 'antd';
import { api } from '../../../lib/api';

const { RangePicker } = DatePicker;
const { Option } = Select;

// 渲染统计卡片函数
const renderStatCard = (title: string, value: React.ReactNode | number | string, suffix?: string, trend?: number) => {
  return (
    <Card className="h-full">
      <div className="p-4">
        <div className="text-gray-500 text-sm mb-1">{title}</div>
        <div className="flex flex-col gap-1">
          {typeof value === 'number' || typeof value === 'string' ? (
            <span className="text-2xl font-semibold">{value}{suffix || ''}</span>
          ) : (
            value
          )}
          {trend !== undefined && (
            <span className={`text-sm ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? `+${trend}%` : `${trend}%`}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
};

// 总结数据类型定义
interface SummaryData {
  summary: {
    period: {
      start: string;
      end: string;
      type: string;
      label: string;
    };
    metrics: {
      totalTasks: number;
      completedTasks: number;
      completionRate: number;
      avgCompletionTime: number;
      overdueTasks: number;
    };
    trendAnalysis: {
      completionRateChange: number;
      taskVolumeChange: number;
      efficiencyChange: number;
    };
  };
  taskBreakdown: Array<{
    status: string;
    count: number;
    percentage: number;
    avgPriority: number;
  }>;
  efficiencyInsights: Array<{
    dimension: string;
    value: number;
    insight: string;
  }>;
  keyProjects: Array<{
    projectId: string;
    projectName: string;
    progress: number;
    status: string;
    milestones: Array<{
      name: string;
      completed: boolean;
      dueDate: string;
      actualCompletionDate: string;
    }>;
  }>;
  recommendations: Array<{
    area: string;
    suggestion: string;
    potentialImpact: string;
  }>;
  visualizationData: {
    taskCompletionTrend: Array<{ date: string; completed: number; total: number }>;
    priorityDistribution: Array<{ name: string; value: number }>;
    timeSpentByCategory: Array<{ category: string; hours: number }>;
  };
}

// 模拟数据
const mockSummaryData: SummaryData = {
  summary: {
    period: {
      start: '2024-01-01',
      end: '2024-01-31',
      type: 'month',
      label: '2024年1月'
    },
    metrics: {
      totalTasks: 48,
      completedTasks: 36,
      completionRate: 75,
      avgCompletionTime: 2.5,
      overdueTasks: 4
    },
    trendAnalysis: {
      completionRateChange: 5,
      taskVolumeChange: -10,
      efficiencyChange: 8
    }
  },
  taskBreakdown: [
    { status: '待处理', count: 8, percentage: 16.67, avgPriority: 2.5 },
    { status: '进行中', count: 4, percentage: 8.33, avgPriority: 3.0 },
    { status: '已完成', count: 36, percentage: 75.0, avgPriority: 2.2 },
    { status: '已取消', count: 0, percentage: 0, avgPriority: 0 }
  ],
  efficiencyInsights: [
    { dimension: '周一', value: 85, insight: '周一开始工作效率较高' },
    { dimension: '周二', value: 90, insight: '周二达到一周效率高峰' },
    { dimension: '周三', value: 88, insight: '周三保持较高效率' },
    { dimension: '周四', value: 82, insight: '周四效率略有下降' },
    { dimension: '周五', value: 75, insight: '周五效率明显下降' },
    { dimension: '周末', value: 40, insight: '周末工作效率较低' }
  ],
  keyProjects: [
    {
      projectId: 'proj1',
      projectName: '产品功能开发',
      progress: 80,
      status: '进行中',
      milestones: [
        {
          name: '需求分析',
          completed: true,
          dueDate: '2024-01-10',
          actualCompletionDate: '2024-01-08'
        },
        {
          name: '开发完成',
          completed: true,
          dueDate: '2024-01-25',
          actualCompletionDate: '2024-01-24'
        },
        {
          name: '测试验收',
          completed: false,
          dueDate: '2024-02-05',
          actualCompletionDate: ''
        }
      ]
    },
    {
      projectId: 'proj2',
      projectName: '系统优化',
      progress: 45,
      status: '进行中',
      milestones: [
        {
          name: '性能分析',
          completed: true,
          dueDate: '2024-01-15',
          actualCompletionDate: '2024-01-15'
        },
        {
          name: '优化实施',
          completed: false,
          dueDate: '2024-02-10',
          actualCompletionDate: ''
        }
      ]
    }
  ],
  recommendations: [
    {
      area: '工作节奏',
      suggestion: '周五适当减少安排重要任务，可安排总结和规划类工作',
      potentialImpact: '提高整体工作效率约10%'
    },
    {
      area: '任务管理',
      suggestion: '对高优先级任务设置更明确的子任务和检查点',
      potentialImpact: '减少延期任务比例'
    },
    {
      area: '团队协作',
      suggestion: '增加每周两次的团队同步会议，及时解决阻碍',
      potentialImpact: '提高跨团队任务完成率'
    }
  ],
  visualizationData: {
    taskCompletionTrend: [
      { date: '1月1日', completed: 2, total: 5 },
      { date: '1月8日', completed: 6, total: 8 },
      { date: '1月15日', completed: 8, total: 12 },
      { date: '1月22日', completed: 10, total: 14 },
      { date: '1月29日', completed: 10, total: 9 }
    ],
    priorityDistribution: [
      { name: '低优先级', value: 10 },
      { name: '中优先级', value: 25 },
      { name: '高优先级', value: 10 },
      { name: '紧急', value: 3 }
    ],
    timeSpentByCategory: [
      { category: '开发', hours: 120 },
      { category: '测试', hours: 40 },
      { category: '会议', hours: 30 },
      { category: '文档', hours: 20 },
      { category: '其他', hours: 10 }
    ]
  }
};

// 状态颜色配置
const STATUS_COLORS = {
  '待处理': '#1890ff',
  '进行中': '#faad14',
  '已完成': '#52c41a',
  '已取消': '#f5222d'
};

// 优先级颜色配置
const PRIORITY_COLORS = ['#52c41a', '#1890ff', '#faad14', '#f5222d'];

export default function SummaryPage() {
  const [activeTab, setActiveTab] = useState<string>('month');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([null, null]);
  const [loading, setLoading] = useState<boolean>(false);
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);

  // 初始化数据
  useEffect(() => {
    fetchSummaryData();
  }, [activeTab]);

  // 获取总结数据
  const fetchSummaryData = async () => {
    setLoading(true);
    try {
      // 这里应该调用真实的API
      // const data = await api.get<SummaryData>(`/api/summary?timeDimension=${activeTab}`);
      
      // 模拟API请求延迟
      await new Promise(resolve => setTimeout(resolve, 500));
      setSummaryData(mockSummaryData);
    } catch (error) {
      console.error('获取总结数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 处理时间维度切换
  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  // 处理日期范围变化
    const handleDateRangeChange = (dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => {
      if (dates && dates[0] && dates[1]) {
        setDateRange([dates[0], dates[1]]);
        message.info('日期范围已更新');
      }
    };

  // 导出报告
  const handleExport = () => {
    // TODO: 实现导出功能
    console.log('导出报告');
  };

  // 分享报告
  const handleShare = () => {
    // TODO: 实现分享功能
    console.log('分享报告');
  };

  // 渲染趋势指示器
  const renderTrendIndicator = (value: number) => {
    if (value > 0) {
      return <ArrowUpOutlined className="text-green-500" />;
    } else if (value < 0) {
      return <ArrowDownOutlined className="text-red-500" />;
    }
    return null;
  };

  // Tab配置
  const tabs: TabsProps['items'] = [
    {
      key: 'week',
        label: '周总结',
        children: <SummaryContent loading={loading} summaryData={summaryData} />
    },
    {
      key: 'month',
      label: '月总结',
      children: <SummaryContent loading={loading} summaryData={summaryData} />
    },
    {
      key: 'quarter',
      label: '季度总结',
      children: <SummaryContent loading={loading} summaryData={summaryData} />
    },
    {
      key: 'year',
      label: '年总结',
      children: <SummaryContent loading={loading} summaryData={summaryData} />
    }
  ];

  return (
    <Card className="shadow-sm">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">工作摘要</h1>
          <p className="text-gray-600">
            查看您的任务完成情况、工作效率和项目进展的详细统计分析
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3 items-center">
          <RangePicker
              value={dateRange}
              onChange={handleDateRangeChange}
              className="w-full sm:w-64"
            />
          <Space>
            <Button
              type="primary"
              icon={<ExportOutlined />}
              onClick={handleExport}
            >
              导出报告
            </Button>
            <Button
              icon={<ShareAltOutlined />}
              onClick={handleShare}
            >
              分享
            </Button>
          </Space>
        </div>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={handleTabChange}
        items={tabs}
        className="mb-6"
      />
    </Card>
  );
}

// 定义摘要内容组件的Props类型
interface SummaryContentProps {
  loading: boolean;
  summaryData: SummaryData | null;
}

// 总结内容组件
function SummaryContent({ loading, summaryData }: SummaryContentProps) {

  if (loading) {
      return (
        <div className="flex justify-center items-center py-20">
          <Spin size="large">
            <div className="text-gray-500 text-lg">加载中...</div>
          </Spin>
        </div>
      );
    }

  if (!summaryData) {
    return (
      <Empty description="暂无总结数据" />
    );
  }

  const { summary, taskBreakdown, efficiencyInsights, keyProjects, recommendations, visualizationData } = summaryData;

  return (
    <div className="space-y-6">
      {/* 时间段信息 */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold">
          {summary.period.label} 工作摘要 ({summary.period.start} 至 {summary.period.end})
        </h2>
      </div>

      {/* 关键指标卡片 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          {renderStatCard(
            '总任务数', 
            summary.metrics.totalTasks,
            '',
            summary.trendAnalysis.taskVolumeChange
          )}
        </Col>
        <Col xs={24} sm={12} md={6}>
          {renderStatCard(
            '已完成任务', 
            summary.metrics.completedTasks
          )}
        </Col>
        <Col xs={24} sm={12} md={6}>
          {renderStatCard(
            '完成率', 
            summary.metrics.completionRate,
            '%',
            summary.trendAnalysis.completionRateChange
          )}
        </Col>
        <Col xs={24} sm={12} md={6}>
          {renderStatCard(
                '平均完成时间', 
                summary.metrics.avgCompletionTime,
                '天'
              )}
            </Col>
            <Col xs={24} sm={12} md={6}>
              {renderStatCard(
                '趋势分析',
                <div className="text-sm space-y-2">
                  <div className="flex justify-between items-center">
                    <span>完成率:</span>
                    <span className={summary.trendAnalysis.completionRateChange >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {summary.trendAnalysis.completionRateChange > 0 ? `+${summary.trendAnalysis.completionRateChange}%` : `${summary.trendAnalysis.completionRateChange}%`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>任务量:</span>
                    <span className={summary.trendAnalysis.taskVolumeChange >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {summary.trendAnalysis.taskVolumeChange > 0 ? `+${summary.trendAnalysis.taskVolumeChange}%` : `${summary.trendAnalysis.taskVolumeChange}%`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>效率:</span>
                    <span className={summary.trendAnalysis.efficiencyChange >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {summary.trendAnalysis.efficiencyChange > 0 ? `+${summary.trendAnalysis.efficiencyChange}%` : `${summary.trendAnalysis.efficiencyChange}%`}
                    </span>
                  </div>
                </div>
              )}
        </Col>
      </Row>

      {/* 任务状态分布和完成趋势 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card title="任务状态分布" className="h-full">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                    <Pie
                    data={taskBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={(entry: { value?: number; data?: { percentage?: number; status?: string } }) => {
                        // 饼图标签渲染 - 使用正确的数据属性
                        const percentage = entry.value || entry.data?.percentage || 0;
                        return `${entry.data?.status || ''}: ${percentage.toFixed(1)}%`;
                      }}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                  {taskBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status as keyof typeof STATUS_COLORS] || '#ccc'} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="任务完成趋势" className="h-full">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={visualizationData.taskCompletionTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="completed" stroke="#52c41a" name="已完成" />
                <Line type="monotone" dataKey="total" stroke="#1890ff" name="总任务" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* 工作效率分析 */}
      <Card title="工作效率分析">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={efficiencyInsights}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="dimension" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" name="效率指数" fill="#1890ff" />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4">
          <h4 className="font-semibold mb-2">效率洞察</h4>
          <ul className="list-disc pl-6 space-y-1">
            {efficiencyInsights
              .filter(insight => insight.insight)
              .map((insight, index) => (
                <li key={index}>{insight.dimension}: {insight.insight}</li>
              ))
            }
          </ul>
        </div>
      </Card>

      {/* 重点项目进展 */}
      <Card title="重点项目进展">
        <div className="space-y-6">
          {keyProjects.map((project) => (
            <div key={project.projectId} className="border-b pb-4 last:border-0 last:pb-0">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold">{project.projectName}</h4>
                <span className={`px-2 py-1 rounded text-xs ${project.status === '进行中' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                  {project.status}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span>进度</span>
                <span>{project.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${project.progress}%` }}
                />
              </div>
              <div className="mt-3">
                <h5 className="text-sm font-medium mb-2">里程碑：</h5>
                <div className="space-y-1">
                  {project.milestones.map((milestone, index) => (
                    <div key={index} className="flex items-center text-sm">
                      <span className={`mr-2 ${milestone.completed ? 'text-green-500' : 'text-gray-400'}`}>
                        {milestone.completed ? '✓' : '○'}
                      </span>
                      <span className="flex-1">{milestone.name}</span>
                      <span className={`text-gray-500 ${milestone.completed ? 'text-green-600' : ''}`}>
                        {milestone.completed ? 
                          `已完成 (${milestone.actualCompletionDate})` : 
                          `截止: ${milestone.dueDate}`
                        }
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 改进建议 */}
      <Card title="改进建议">
        <div className="space-y-4">
          {recommendations.map((rec, index) => (
            <div key={index} className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-1">{rec.area}</h4>
              <p className="mb-2">{rec.suggestion}</p>
              <div className="text-sm text-blue-600">预期效果: {rec.potentialImpact}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}