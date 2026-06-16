import React, { useState, useEffect } from 'react';
import FormRender, { useForm } from 'form-render';
import { Button, Result, Typography, App } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { evaluationSchema } from '../schema/evaluationSchema';
import CourseInfoCard from '../components/CourseInfoCard';
import { Course } from '../data/mockData';
import './EvaluationPage.css';

const { Title } = Typography;

interface EvaluationPageProps {
  course: Course;
  onBack: () => void;
  onSubmitSuccess: (courseId: string) => void;
}

const EvaluationPage: React.FC<EvaluationPageProps> = ({ course, onBack, onSubmitSuccess }) => {
  const { message } = App.useApp();
  const form = useForm();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // 从 course 对象构建 courseInfo
  const courseInfo = {
    courseName: course.name,
    teacherName: `${course.teacher.name} (${course.teacher.title})`,
    semester: course.semester,
  };

  /**
   * 修复 label for 属性与表单字段 id 的匹配问题
   * 
   * 说明：这是针对 form-render 库的临时解决方案。
   * form-render 在某些情况下生成的 label 的 for 属性与表单字段的 id 不匹配，
   * 这会导致浏览器自动填充功能和辅助功能工具无法正常工作。
   * 
   * 此解决方案通过以下方式修复：
   * 1. 自动检测并修复 label 和 input 的关联关系
   * 2. 为没有 id 的表单字段自动生成唯一 id
   * 3. 确保 label 的 for 属性正确指向对应的表单字段 id
   * 
   * 注意：这是一个运行时修复方案，如果 form-render 库未来版本修复了此问题，
   * 可以考虑移除此代码。
   */
  useEffect(() => {
    const fixLabelForAttributes = () => {
      const formItems = document.querySelectorAll('.evaluation-page .ant-form-item');
      formItems.forEach((item) => {
        const label = item.querySelector('.ant-form-item-label label');
        if (!label) return;

        // 查找表单控件：input, textarea, 或 Rate 组件
        let input: HTMLElement | null = item.querySelector('input:not([type="hidden"]), textarea') as HTMLElement | null;
        
        // 如果没有找到标准的 input，尝试找 Rate 组件（它可能包装在 div 中）
        if (!input) {
          const rateContainer = item.querySelector('.ant-rate');
          if (rateContainer && rateContainer instanceof HTMLElement) {
            input = rateContainer;
          }
        }

        if (label && input) {
          const labelFor = label.getAttribute('for');
          let inputId = input.getAttribute('id');

          // 如果没有 id，尝试从 name 属性生成，或者使用 label 的文本生成
          if (!inputId) {
            const nameAttr = input.getAttribute('name');
            if (nameAttr) {
              inputId = nameAttr.replace(/[\[\]\.]/g, '_');
            } else {
              const fieldName = label.textContent?.trim() || 'field';
              inputId = `field_${fieldName.replace(/\s+/g, '_').replace(/[^\w]/g, '')}_${Math.random().toString(36).substr(2, 9)}`;
            }
            input.setAttribute('id', inputId);
          }

          // 确保 label 的 for 属性匹配 input 的 id
          if (labelFor !== inputId) {
            label.setAttribute('for', inputId);
          }
        }
      });
    };

    // 延迟执行，确保 DOM 已渲染
    const timer = setTimeout(fixLabelForAttributes, 200);
    
    // 监听表单变化，重新修复
    const observer = new MutationObserver(() => {
      setTimeout(fixLabelForAttributes, 50);
    });
    const container = document.querySelector('.evaluation-page');
    if (container) {
      observer.observe(container, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['id', 'for'],
      });
    }

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  /**
   * 表单提交处理函数
   * 
   * 注意：当前版本为前端演示版本，使用 setTimeout 模拟 API 调用延迟（1.5秒）。
   * 实际项目中需要替换为真实的 API 调用。
   * 
   * 接入真实 API 示例：
   * ```typescript
   * const response = await axios.post('/api/evaluation/submit', values);
   * ```
   * 
   * @param values - 表单提交的值
   */
  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      // TODO: 替换为真实的 API 调用
      // 当前使用 setTimeout 模拟 API 调用延迟（1.5秒）
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // 开发环境日志记录（生产环境应使用专业的日志服务）
      console.log('Form values:', { courseId: course.id, ...values });
      
      message.success('提交成功！感谢您的评价');
      onSubmitSuccess(course.id);
      setSubmitted(true);
    } catch (error) {
      // 错误处理：生产环境应记录到错误追踪服务（如 Sentry）
      console.error('Evaluation submission error:', error);
      message.error('提交失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Result
        status="success"
        title="评价已提交"
        subTitle={`感谢您对「${course.name}」课程的评价，您的反馈将帮助教师改进教学质量。`}
        extra={[
          <Button type="primary" key="back" onClick={onBack}>
            返回课程列表
          </Button>,
        ]}
      />
    );
  }

  return (
    <div className="evaluation-page">
      {/* 返回按钮 */}
      <div className="evaluation-back-bar">
        <Button 
          type="link" 
          icon={<ArrowLeftOutlined />} 
          onClick={onBack}
          className="back-button"
        >
          返回课程列表
        </Button>
      </div>

      <div style={{ marginBottom: 24, textAlign: 'center' }}>
        <Title level={3}>课程教学质量评价</Title>
        <Typography.Text type="secondary">
          请客观、公正地对本学期课程进行评价，您的评价结果将匿名处理。
        </Typography.Text>
      </div>

      <CourseInfoCard courseInfo={courseInfo} />
      
      <FormRender
        form={form}
        schema={evaluationSchema as any}
        onFinish={onFinish}
        layout="vertical"
        footer={false}
      />
      
      <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center', gap: 16 }}>
        <Button 
          onClick={() => form.resetFields()} 
          size="large" 
          style={{ width: 160, height: 40 }}
          disabled={loading}
        >
          重置
        </Button>
        <Button 
          type="primary" 
          onClick={form.submit} 
          loading={loading} 
          size="large" 
          style={{ width: 160, height: 40 }}
        >
          提交评价
        </Button>
      </div>
    </div>
  );
};

export default EvaluationPage;
