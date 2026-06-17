import React, { useState, useEffect, useRef } from 'react';
import FormRender, { useForm } from 'form-render';
import { Button, Typography, App, Card, Rate } from 'antd';
import { ArrowLeftOutlined, EditOutlined } from '@ant-design/icons';
import { evaluationSchema } from '../schema/evaluationSchema';
import CourseInfoCard from '../components/CourseInfoCard';
import { Course, EvaluationData } from '../data/mockData';
import './EvaluationPage.css';

const { Title, Text, Paragraph } = Typography;

interface EvaluationPageProps {
  course: Course;
  mode: 'view' | 'edit';
  onBack: () => void;
  onEdit: () => void;
  onCancelEdit: () => void;
  onSubmitSuccess: (courseId: string, evaluationData: EvaluationData) => void;
}

const ratingLabels = [
  { key: 'teachingAttitude', label: '教学态度', desc: '教师的教学态度是否认真负责、耐心细致' },
  { key: 'teachingContent', label: '教学内容', desc: '课程内容的丰富性、前沿性和实用性' },
  { key: 'teachingMethod', label: '教学方法', desc: '教师的教学方法是否灵活多样、易于理解' },
  { key: 'interaction', label: '课堂互动', desc: '课堂互动氛围是否活跃、师生交流是否充分' },
];

const EvaluationPage: React.FC<EvaluationPageProps> = ({
  course,
  mode,
  onBack,
  onEdit,
  onCancelEdit,
  onSubmitSuccess,
}) => {
  const { message } = App.useApp();
  const form = useForm();
  const [loading, setLoading] = useState(false);

  const courseInfo = {
    courseName: course.name,
    teacherName: `${course.teacher.name} (${course.teacher.title})`,
    semester: course.semester,
  };

  useEffect(() => {
    if (mode !== 'edit' || !course.evaluationData) {
      return;
    }

    const setFormValues = () => {
      try {
        const formInstance = form;
        if (formInstance && typeof (formInstance as any).setFieldsValue === 'function') {
          (formInstance as any).setFieldsValue(course.evaluationData);
        } else if (formInstance && typeof (formInstance as any).setValues === 'function') {
          (formInstance as any).setValues(course.evaluationData);
        }
      } catch (e) {
        console.warn('Failed to set form values:', e);
      }
    };

    const timer = setTimeout(setFormValues, 100);
    return () => clearTimeout(timer);
  }, [mode, course.evaluationData, form]);

  useEffect(() => {
    const fixLabelForAttributes = () => {
      const formItems = document.querySelectorAll('.evaluation-page .ant-form-item');
      formItems.forEach((item) => {
        const label = item.querySelector('.ant-form-item-label label');
        if (!label) return;

        let input: HTMLElement | null = item.querySelector('input:not([type="hidden"]), textarea') as HTMLElement | null;
        
        if (!input) {
          const rateContainer = item.querySelector('.ant-rate');
          if (rateContainer && rateContainer instanceof HTMLElement) {
            input = rateContainer;
          }
        }

        if (label && input) {
          const labelFor = label.getAttribute('for');
          let inputId = input.getAttribute('id');

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

          if (labelFor !== inputId) {
            label.setAttribute('for', inputId);
          }
        }
      });
    };

    const timer = setTimeout(fixLabelForAttributes, 200);
    
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

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      console.log('Form values:', { courseId: course.id, ...values });
      
      const evaluationData: EvaluationData = {
        ratings: values.ratings,
        feedback: values.feedback,
      };
      
      message.success('提交成功！感谢您的评价');
      onSubmitSuccess(course.id, evaluationData);
    } catch (error) {
      console.error('Evaluation submission error:', error);
      message.error('提交失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderViewMode = () => {
    const data = course.evaluationData;
    
    if (!data) {
      return (
        <Card>
          <Paragraph type="secondary">暂无评价数据</Paragraph>
        </Card>
      );
    }

    const averageScore = data.ratings
      ? Object.values(data.ratings).reduce((sum, val) => sum + val, 0) /
        Object.values(data.ratings).length
      : 0;

    return (
      <div className="evaluation-view">
        <Card className="score-summary-card">
          <div className="score-summary">
            <div className="score-circle">
              <span className="score-number">{averageScore.toFixed(1)}</span>
              <span className="score-full">/ 5.0</span>
            </div>
            <div className="score-info">
              <Title level={4} style={{ margin: 0 }}>综合评分</Title>
              <Text type="secondary">
                提交时间：{formatDate(data.submittedAt)}
              </Text>
            </div>
          </div>
        </Card>

        <Card 
          title="教学评分" 
          className="rating-detail-card"
          style={{ marginTop: 16 }}
        >
          <div className="rating-list">
            {ratingLabels.map((item) => (
              <div key={item.key} className="rating-item">
                <div className="rating-item-header">
                  <Text strong>{item.label}</Text>
                  <Rate 
                    disabled 
                    value={data.ratings?.[item.key as keyof typeof data.ratings] || 0} 
                  />
                </div>
                <Text type="secondary" className="rating-desc">
                  {item.desc}
                </Text>
              </div>
            ))}
          </div>
        </Card>

        <Card 
          title="意见与建议" 
          className="feedback-card"
          style={{ marginTop: 16 }}
        >
          <Paragraph style={{ whiteSpace: 'pre-wrap', marginBottom: 0 }}>
            {data.feedback?.comments || '暂无'}
          </Paragraph>
        </Card>

        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center', gap: 16 }}>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={onBack}
            size="large"
            style={{ width: 160, height: 40 }}
          >
            返回列表
          </Button>
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            onClick={onEdit}
            size="large"
            style={{ width: 160, height: 40 }}
          >
            修改评价
          </Button>
        </div>
      </div>
    );
  };

  const renderEditMode = () => {
    const initialValues = course.evaluated && course.evaluationData
      ? course.evaluationData
      : undefined;

    return (
      <>
        <CourseInfoCard courseInfo={courseInfo} />
        
        <FormRender
          key={`${course.id}-${mode}-${course.evaluated}`}
          form={form}
          schema={evaluationSchema as any}
          onFinish={onFinish}
          layout="vertical"
          footer={false}
          initialValues={initialValues}
        />
        
        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center', gap: 16 }}>
          <Button 
            onClick={onCancelEdit} 
            size="large" 
            style={{ width: 160, height: 40 }}
            disabled={loading}
          >
            取消
          </Button>
          <Button 
            onClick={() => {
              try {
                if (typeof (form as any).resetFields === 'function') {
                  (form as any).resetFields();
                }
              } catch (e) {
                console.warn('Failed to reset form:', e);
              }
            }} 
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
            {course.evaluated ? '保存修改' : '提交评价'}
          </Button>
        </div>
      </>
    );
  };

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
      </div>

      <div style={{ marginBottom: 24, textAlign: 'center' }}>
        <Title level={3}>
          {mode === 'view' ? '评价详情' : course.evaluated ? '修改评价' : '课程教学质量评价'}
        </Title>
        <Typography.Text type="secondary">
          {mode === 'view' 
            ? '您可以查看已提交的评价内容，或点击修改按钮进行编辑' 
            : '请客观、公正地对本学期课程进行评价，您的评价结果将匿名处理。'
          }
        </Typography.Text>
      </div>

      {mode === 'view' ? renderViewMode() : renderEditMode()}
    </div>
  );
};

export default EvaluationPage;
