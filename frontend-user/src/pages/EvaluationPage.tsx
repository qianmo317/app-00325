import React, { useState, useEffect } from 'react';
import FormRender, { useForm } from 'form-render';
import { Button, Result, Typography, App, Card, Rate, Divider } from 'antd';
import { ArrowLeftOutlined, EditOutlined } from '@ant-design/icons';
import { evaluationSchema } from '../schema/evaluationSchema';
import CourseInfoCard from '../components/CourseInfoCard';
import { Course, EvaluationData } from '../data/mockData';
import { PageMode } from '../App';
import './EvaluationPage.css';

const { Title, Text, Paragraph } = Typography;

interface EvaluationPageProps {
  course: Course;
  mode: PageMode;
  onBack: () => void;
  onSubmitSuccess: (courseId: string, evaluationData: EvaluationData) => void;
  onSwitchToEdit: () => void;
  onSwitchToView: () => void;
}

const ratingLabels: Record<string, string> = {
  teachingAttitude: '教学态度',
  teachingContent: '教学内容',
  teachingMethod: '教学方法',
  interaction: '课堂互动',
};

const EvaluationPage: React.FC<EvaluationPageProps> = ({
  course,
  mode,
  onBack,
  onSubmitSuccess,
  onSwitchToEdit,
  onSwitchToView,
}) => {
  const { message } = App.useApp();
  const form = useForm();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const isViewMode = mode === 'view';
  const isEditMode = mode === 'edit';

  const formInitialValues = isEditMode && course.evaluationData
    ? {
        ratings: course.evaluationData.ratings,
        feedback: course.evaluationData.feedback,
      }
    : undefined;

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

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const evaluationData: EvaluationData = {
        ratings: values.ratings,
        feedback: values.feedback,
        submittedAt: new Date().toISOString(),
      };

      console.log('Form values:', { courseId: course.id, ...values });

      message.success(isEditMode ? '修改成功！评价已更新' : '提交成功！感谢您的评价');
      onSubmitSuccess(course.id, evaluationData);
      setSubmitted(true);
    } catch (error) {
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
        title={isEditMode ? '评价已更新' : '评价已提交'}
        subTitle={`感谢您对「${course.name}」课程的评价，您的反馈将帮助教师改进教学质量。`}
        extra={[
          <Button type="primary" key="back" onClick={onBack}>
            返回课程列表
          </Button>,
        ]}
      />
    );
  }

  const pageTitle = isViewMode
    ? '评价详情查看'
    : isEditMode
    ? '修改课程评价'
    : '课程教学质量评价';

  const pageDesc = isViewMode
    ? '以下是您对本课程的评价内容'
    : isEditMode
    ? '您可以修改之前的评价内容，修改后提交将覆盖原有评价'
    : '请客观、公正地对本学期课程进行评价，您的评价结果将匿名处理。';

  const renderViewMode = () => {
    const data = course.evaluationData;

    if (!data) {
      return (
        <div className="evaluation-view">
          <Card className="view-empty-card">
            <div className="view-empty-content">
              <div className="view-empty-icon">📋</div>
              <Title level={5} style={{ marginTop: 12, marginBottom: 8 }}>
                暂无评价详情
              </Title>
              <Text type="secondary">
                该课程已完成评价，但历史评价数据未保存。您可以点击下方按钮重新填写评价。
              </Text>
            </div>
          </Card>

          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center', gap: 16 }}>
            <Button size="large" style={{ width: 160, height: 40 }} onClick={onBack}>
              返回列表
            </Button>
            <Button
              type="primary"
              icon={<EditOutlined />}
              size="large"
              style={{ width: 160, height: 40 }}
              onClick={onSwitchToEdit}
            >
              填写评价
            </Button>
          </div>
        </div>
      );
    }

    const avgRating =
      Object.values(data.ratings).reduce((sum, r) => sum + r, 0) /
      Object.values(data.ratings).length;

    return (
      <div className="evaluation-view">
        <Card className="view-ratings-card">
          <div className="view-ratings-header">
            <div className="view-avg-rating">
              <span className="avg-score">{avgRating.toFixed(1)}</span>
              <span className="avg-label">综合评分</span>
            </div>
            <Rate disabled allowHalf value={avgRating} className="avg-rate" />
          </div>
          <Divider />
          <div className="rating-items">
            {Object.entries(data.ratings).map(([key, value]) => (
              <div key={key} className="rating-item">
                <span className="rating-label">{ratingLabels[key] || key}</span>
                <Rate disabled value={value} />
              </div>
            ))}
          </div>
        </Card>

        <Card className="view-feedback-card" title="意见与建议">
          <Paragraph className="feedback-text">{data.feedback.comments}</Paragraph>
          <div className="submitted-time">
            <Text type="secondary">
              提交时间：{new Date(data.submittedAt).toLocaleString('zh-CN')}
            </Text>
          </div>
        </Card>

        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center', gap: 16 }}>
          <Button size="large" style={{ width: 160, height: 40 }} onClick={onBack}>
            返回列表
          </Button>
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="large"
            style={{ width: 160, height: 40 }}
            onClick={onSwitchToEdit}
          >
            修改评价
          </Button>
        </div>
      </div>
    );
  };

  const renderFormMode = () => (
    <>
      <FormRender
        form={form}
        schema={evaluationSchema as any}
        onFinish={onFinish}
        layout="vertical"
        footer={false}
        initialValues={formInitialValues}
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
          {isEditMode ? '保存修改' : '提交评价'}
        </Button>
      </div>
    </>
  );

  return (
    <div className="evaluation-page">
      <div className="evaluation-back-bar">
        <Button
          type="link"
          icon={<ArrowLeftOutlined />}
          onClick={onBack}
          className="back-button"
        >
          返回课程列表
        </Button>
        {isEditMode && (
          <Button
            type="link"
            onClick={onSwitchToView}
            className="back-button"
            style={{ marginLeft: 'auto' }}
          >
            取消修改
          </Button>
        )}
      </div>

      <div style={{ marginBottom: 24, textAlign: 'center' }}>
        <Title level={3}>{pageTitle}</Title>
        <Typography.Text type="secondary">{pageDesc}</Typography.Text>
      </div>

      <CourseInfoCard courseInfo={courseInfo} />

      {isViewMode ? renderViewMode() : renderFormMode()}
    </div>
  );
};

export default EvaluationPage;
