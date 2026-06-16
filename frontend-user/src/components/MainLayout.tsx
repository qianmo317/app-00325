import React from 'react';
import { Layout, Typography, Avatar, Space, Dropdown, Button } from 'antd';
import type { MenuProps } from 'antd';
import { UserOutlined, LogoutOutlined, IdcardOutlined } from '@ant-design/icons';
import { User } from '../data/mockData';

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;

interface MainLayoutProps {
  children: React.ReactNode;
  user: User;
  onLogout: () => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, user, onLogout }) => {
  // 用户下拉菜单
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'info',
      label: (
        <div style={{ padding: '8px 0' }}>
          <div style={{ fontWeight: 500 }}>{user.name}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {user.studentId} | {user.major}
          </Text>
        </div>
      ),
      icon: <IdcardOutlined />,
      disabled: true,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: '退出登录',
      icon: <LogoutOutlined />,
      danger: true,
      onClick: onLogout,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      <Header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#fff',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
          padding: '0 24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div
            style={{
              width: 32,
              height: 32,
              backgroundColor: '#1677ff',
              borderRadius: 6,
              marginRight: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 'bold',
            }}
          >
            E
          </div>
          <Title level={4} style={{ margin: 0, color: '#000000e0' }}>
            学生评教系统
          </Title>
        </div>
        
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
          <Button type="text" style={{ height: 'auto', padding: '4px 8px' }}>
            <Space>
              <span style={{ color: '#000000a6' }}>{user.name}</span>
              <Avatar 
                src={user.avatar} 
                icon={<UserOutlined />} 
                style={{ backgroundColor: '#1677ff' }} 
              />
            </Space>
          </Button>
        </Dropdown>
      </Header>
      <Content style={{ padding: '24px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <div
          style={{
            padding: 24,
            minHeight: 380,
            background: '#fff',
            borderRadius: 8,
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)',
          }}
        >
          {children}
        </div>
      </Content>
      <Footer style={{ textAlign: 'center', color: '#00000073' }}>
        Student Evaluation System ©{new Date().getFullYear()} Created by Frontend Team
      </Footer>
    </Layout>
  );
};

export default MainLayout;
