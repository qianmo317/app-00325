import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Checkbox, App } from 'antd';
import { UserOutlined, LockOutlined, BookOutlined } from '@ant-design/icons';
import { User } from '../data/mockData';
import './LoginPage.css';

const { Title, Text } = Typography;

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
}

interface LoginFormValues {
  username: string;
  password: string;
  remember: boolean;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);

  /**
   * 登录表单提交处理
   * 
   * 注意：当前为前端演示版本，使用模拟验证。
   * 实际项目中需要调用后端 API 进行真实的身份验证。
   */
  const onFinish = async (values: LoginFormValues) => {
    setLoading(true);
    try {
      // 模拟 API 调用延迟
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // 模拟登录验证（演示用，实际应调用后端 API）
      if (values.username === 'student' && values.password === '123456') {
        const user: User = {
          id: 'u1',
          username: values.username,
          name: '张三',
          studentId: '2024001001',
          major: '计算机科学与技术',
          grade: '2024级',
          avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop&crop=face',
        };
        
        message.success(`欢迎回来，${user.name}！`);
        onLoginSuccess(user);
      } else {
        message.error('用户名或密码错误，请重试');
      }
    } catch (error) {
      console.error('Login error:', error);
      message.error('登录失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Logo 和标题 */}
        <div className="login-header">
          <div className="login-logo">
            <BookOutlined className="logo-icon" />
          </div>
          <Title level={2} className="login-title">学生评教系统</Title>
          <Text type="secondary" className="login-subtitle">
            请登录以继续访问评教功能
          </Text>
        </div>

        {/* 登录表单卡片 */}
        <Card className="login-card" variant="borderless">
          <Form
            name="login"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            size="large"
            layout="vertical"
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: '请输入用户名' }]}
            >
              <Input
                prefix={<UserOutlined className="input-icon" />}
                placeholder="用户名"
                autoComplete="username"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password
                prefix={<LockOutlined className="input-icon" />}
                placeholder="密码"
                autoComplete="current-password"
              />
            </Form.Item>

            <Form.Item>
              <div className="login-options">
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox>记住我</Checkbox>
                </Form.Item>
                <span 
                  className="forgot-link" 
                  onClick={() => message.info('请前往教务处线下处理')}
                >
                  忘记密码？
                </span>
              </div>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                className="login-button"
              >
                登录
              </Button>
            </Form.Item>
          </Form>

          {/* 测试账号提示 */}
          <div className="login-hint">
            <Text type="secondary">
              演示账号：<Text code>student</Text> / <Text code>123456</Text>
            </Text>
          </div>
        </Card>

        {/* 页脚 */}
        <div className="login-footer">
          <Text type="secondary">
            © 2025 学生评教系统 | 教务处
          </Text>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
