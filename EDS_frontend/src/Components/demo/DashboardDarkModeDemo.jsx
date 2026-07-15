import React from 'react';
import { Table, Button, Tag, Modal, Form, Input } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import DashboardPageWrapper, { DashboardCard, DashboardTable, StatsCard } from '../dashboard/DashboardPageWrapper';

// This is a demo component to showcase the improved dashboard dark mode UI
const DashboardDarkModeDemo = () => {
  const sampleData = [
    {
      id: 1,
      title: 'AfriDATAi Platform Launch',
      author: 'John Doe',
      status: 'published',
      created_at: '2024-01-15',
    },
    {
      id: 2,
      title: 'Expert Database Growth',
      author: 'Jane Smith',
      status: 'draft',
      created_at: '2024-01-10',
    }
  ];

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text) => (
        <span className="font-semibold" style={{ color: 'var(--theme-text-primary)' }}>
          {text}
        </span>
      ),
    },
    {
      title: 'Author',
      dataIndex: 'author',
      key: 'author',
      render: (text) => (
        <span style={{ color: 'var(--theme-text-secondary)' }}>
          {text}
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'published' ? 'green' : 'default'}>
          {status === 'published' ? 'Published' : 'Draft'}
        </Tag>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => (
        <span style={{ color: 'var(--theme-text-secondary)' }}>
          {new Date(date).toLocaleDateString()}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: () => (
        <div className="flex items-center gap-2">
          <Button size="small" icon={<EditOutlined />} />
          <Button size="small" danger icon={<DeleteOutlined />} />
        </div>
      ),
    },
  ];

  return (
    <DashboardPageWrapper
      title="Dashboard Dark Mode Demo"
      subtitle="Experience the beautiful new dashboard UI with full dark mode support"
      actions={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          className="dashboard-btn-primary"
          style={{ background: 'var(--color-primary)', borderColor: 'var(--color-primary)' }}
        >
          Add New Item
        </Button>
      }
    >
      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Posts"
          value="124"
          subtitle="12 this month"
          trend={{ positive: true, value: '+8%', label: 'vs last month' }}
        />
        <StatsCard
          title="Published"
          value="98"
          subtitle="Published posts"
          trend={{ positive: true, value: '+5%', label: 'vs last month' }}
        />
        <StatsCard
          title="Drafts"
          value="26"
          subtitle="Draft posts"
          trend={{ positive: false, value: '-2%', label: 'vs last month' }}
        />
        <StatsCard
          title="Views"
          value="15.2K"
          subtitle="Total views"
          trend={{ positive: true, value: '+15%', label: 'vs last month' }}
        />
      </div>

      {/* Main Content Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <DashboardCard title="Recent Activity">
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--theme-bg-secondary)' }}>
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-sm">
                ✓
              </div>
              <div>
                <p className="dashboard-title text-sm font-semibold">New expert registered</p>
                <p className="dashboard-meta text-xs">Dr. Sarah Johnson joined 2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--theme-bg-secondary)' }}>
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm">
                📄
              </div>
              <div>
                <p className="dashboard-title text-sm font-semibold">Blog post published</p>
                <p className="dashboard-meta text-xs">"Expert Insights" was published</p>
              </div>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard title="Quick Actions">
          <div className="grid grid-cols-2 gap-3">
            <Button className="dashboard-btn-secondary h-20 flex flex-col items-center justify-center">
              <PlusOutlined className="text-xl mb-1" />
              <span className="text-sm">Add Expert</span>
            </Button>
            <Button className="dashboard-btn-secondary h-20 flex flex-col items-center justify-center">
              <EditOutlined className="text-xl mb-1" />
              <span className="text-sm">Create Post</span>
            </Button>
          </div>
        </DashboardCard>
      </div>

      {/* Data Table */}
      <DashboardCard title="Content Management">
        <DashboardTable>
          <Table
            dataSource={sampleData}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 5 }}
          />
        </DashboardTable>
      </DashboardCard>
    </DashboardPageWrapper>
  );
};

export default DashboardDarkModeDemo;