import React, { useState, useEffect } from 'react';
import FormRender, { useForm } from 'form-render';
import { Button, Result, Typography, App, Card, Rate, Empty } from 'antd';
import { ArrowLeftOutlined, EditOutlined } from '@ant-design/icons';
import { evaluationSchema } from '../schema/evaluationSchema';
import CourseInfoCard from '../components/CourseInfoCard';
import { Course, EvaluationData } from '../data/mockData';
import './EvaluationPage.css';

const { Title } = Typography;

// 评价页面模式：view 查看 / edit 修改 / create 新建
type EvaluationMode = 'view' | 'edit' | 'create';

// 教学评分维度配置（与 evaluationSchema 中的字段保持一致）
const RATING_ITEMS = [
  { field: 'teachingAttitude', label: '教学态度', description: '教学态度是否认真负责、耐心细致' },
  { field: 'teachingContent', label: '教学内容', description: '课程内容的丰富性、前沿性和实用性' },
  { field: 'teachingMethod', label: '教学方法', description: '教学方法是否灵活多样、易于理解' },
  { field: 'interaction', label: '课堂互动', description: '课堂互动氛围是否活跃、师生交流是否充分' },
] as const;

interface EvaluationPageProps {
  course: Course;
  onBack: () => void;
  onSubmitSuccess: (courseId: string, values: EvaluationData) => void;
}

const EvaluationPage: React.FC<EvaluationPageProps> = ({ course, onBack, onSubmitSuccess }) => {
  const { message } = App.useApp();
  const form = useForm();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  // 已评价课程默认进入查看模式，未评价课程进入新建模式
  const [mode, setMode] = useState<EvaluationMode>(
    course.evaluated ? 'view' : 'create'
  );

  // 从 course 对象构建 courseInfo
  const courseInfo = {
    courseName: course.name,
    teacherName: `${course.teacher.name} (${course.teacher.title})`,
    semester: course.semester,
  };

  // 各模式下的标题与说明
  const headerText = {
    view: {
      title: '我的评价',
      subtitle: '以下是您对该课程的评价内容，您可随时点击「修改评价」进行更新。',
    },
    edit: {
      title: '修改评价',
      subtitle: '请重新对该课程进行评价，提交后将更新您的评价记录。',
    },
    create: {
      title: '课程教学质量评价',
      subtitle: '请客观、公正地对本学期课程进行评价，您的评价结果将匿名处理。',
    },
  }[mode];

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
  }, [mode]);

  // 进入修改模式时，回显已提交的评价数据
  useEffect(() => {
    if (mode === 'edit' && course.evaluation) {
      const timer = setTimeout(() => {
        form.setValues(course.evaluation);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [mode, course.evaluation, form]);

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
      
      onSubmitSuccess(course.id, values as EvaluationData);

      if (mode === 'create') {
        // 新建评价：展示提交成功结果页
        message.success('提交成功！感谢您的评价');
        setSubmitted(true);
      } else {
        // 修改评价：返回查看模式，回显最新数据
        message.success('评价已更新');
        setMode('view');
      }
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
        <Title level={3}>{headerText.title}</Title>
        <Typography.Text type="secondary">
          {headerText.subtitle}
        </Typography.Text>
      </div>

      <CourseInfoCard courseInfo={courseInfo} />

      {/* 查看模式：只读展示已提交的评价 */}
      {mode === 'view' && (
        course.evaluation ? (
          <div className="evaluation-view">
            <Card title="教学评分" className="view-section-card" variant="borderless">
              {RATING_ITEMS.map((item) => {
                const value = course.evaluation!.ratings[item.field];
                return (
                  <div className="view-rating-item" key={item.field}>
                    <div className="view-rating-info">
                      <div className="view-rating-label">{item.label}</div>
                      <div className="view-rating-desc">{item.description}</div>
                    </div>
                    <div className="view-rating-score">
                      <Rate disabled value={value} />
                      <span className="view-rating-value">{value} / 5</span>
                    </div>
                  </div>
                );
              })}
            </Card>

            <Card title="意见与建议" className="view-section-card" variant="borderless">
              <Typography.Paragraph className="view-comments-text">
                {course.evaluation.feedback.comments}
              </Typography.Paragraph>
            </Card>

            <div className="evaluation-actions">
              <Button 
                size="large" 
                style={{ width: 160, height: 40 }}
                onClick={onBack}
              >
                返回课程列表
              </Button>
              <Button 
                type="primary" 
                icon={<EditOutlined />}
                size="large" 
                style={{ width: 160, height: 40 }}
                onClick={() => setMode('edit')}
              >
                修改评价
              </Button>
            </div>
          </div>
        ) : (
          <Empty description="暂无评价详情数据">
            <Button type="primary" onClick={() => setMode('create')}>
              去评价
            </Button>
          </Empty>
        )
      )}

      {/* 新建 / 修改模式：渲染表单 */}
      {(mode === 'create' || mode === 'edit') && (
        <>
          <FormRender
            form={form}
            schema={evaluationSchema as any}
            onFinish={onFinish}
            layout="vertical"
            footer={false}
          />
          
          <div className="evaluation-actions">
            {mode === 'edit' ? (
              <>
                <Button 
                  onClick={() => setMode('view')} 
                  size="large" 
                  style={{ width: 160, height: 40 }}
                  disabled={loading}
                >
                  取消
                </Button>
                <Button 
                  type="primary" 
                  onClick={form.submit} 
                  loading={loading} 
                  size="large" 
                  style={{ width: 160, height: 40 }}
                >
                  提交修改
                </Button>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default EvaluationPage;
