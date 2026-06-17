import React, { useState, useEffect } from 'react';
import FormRender, { useForm } from 'form-render';
import { Button, Typography, App, Rate, Card, Descriptions, Tag, Alert, Result } from 'antd';
import { ArrowLeftOutlined, EditOutlined, SaveOutlined, WarningOutlined, PlusOutlined } from '@ant-design/icons';
import { evaluationSchema } from '../schema/evaluationSchema';
import CourseInfoCard from '../components/CourseInfoCard';
import { Course, EvaluationData } from '../data/mockData';
import './EvaluationPage.css';

const { Title, Text, Paragraph } = Typography;

interface EvaluationPageProps {
  course: Course;
  onBack: () => void;
  onSubmitSuccess: (courseId: string, evaluationData: EvaluationData) => void;
}

const ratingLabels: Record<string, string> = {
  teachingAttitude: '教学态度',
  teachingContent: '教学内容',
  teachingMethod: '教学方法',
  interaction: '课堂互动',
};

const ratingDescriptions: Record<string, string> = {
  teachingAttitude: '评价教师的教学态度是否认真负责、耐心细致',
  teachingContent: '评价课程内容的丰富性、前沿性和实用性',
  teachingMethod: '评价教师的教学方法是否灵活多样、易于理解',
  interaction: '评价课堂互动氛围是否活跃、师生交流是否充分',
};

const EvaluationPage: React.FC<EvaluationPageProps> = ({ course, onBack, onSubmitSuccess }) => {
  const { message } = App.useApp();
  const form = useForm();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const isViewMode = course.evaluated && !isEditing;
  const hasEvaluationData = !!course.evaluationData;

  const courseInfo = {
    courseName: course.name,
    teacherName: `${course.teacher.name} (${course.teacher.title})`,
    semester: course.semester,
  };

  useEffect(() => {
    if (isEditing && course.evaluationData) {
      const initData = {
        ratings: course.evaluationData.ratings,
        feedback: course.evaluationData.feedback,
      };
      setTimeout(() => {
        form.setValues(initData);
      }, 0);
    }
  }, [isEditing, course.evaluationData, form]);

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
  }, [isEditing]);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      console.log('Form values:', { courseId: course.id, ...values });
      
      const evaluationData: EvaluationData = {
        ratings: values.ratings,
        feedback: values.feedback,
        submittedAt: new Date().toISOString(),
      };

      message.success(
        isEditing 
          ? (hasEvaluationData ? '修改成功！评价已更新' : '提交成功！感谢您的评价')
          : '提交成功！感谢您的评价'
      );
      onSubmitSuccess(course.id, evaluationData);
      setIsEditing(false);
    } catch (error) {
      console.error('Evaluation submission error:', error);
      message.error('提交失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    form.resetFields();
  };

  if (isViewMode) {
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
          <Title level={3}>评价详情</Title>
          <Text type="secondary">
            {hasEvaluationData 
              ? '您已完成对本课程的评价，以下是您的评价内容'
              : '您已完成对本课程的评价'
            }
          </Text>
        </div>

        <CourseInfoCard courseInfo={courseInfo} />

        {hasEvaluationData ? (
          <>
            {(() => {
              const { ratings, feedback, submittedAt } = course.evaluationData!;
              const avgRating = Object.values(ratings).reduce((sum, r) => sum + r, 0) / Object.keys(ratings).length;
              return (
                <>
                  <Card 
                    className="evaluation-detail-card"
                    title={
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>教学评分</span>
                        <Tag color="blue" style={{ marginLeft: 8 }}>
                          平均分：{avgRating.toFixed(1)} 分
                        </Tag>
                      </div>
                    }
                    style={{ marginBottom: 16 }}
                  >
                    <Descriptions column={1} bordered size="middle">
                      {Object.entries(ratings).map(([key, value]) => (
                        <Descriptions.Item key={key} label={
                          <div>
                            <Text strong>{ratingLabels[key]}</Text>
                            <div style={{ fontSize: 12, color: '#999', fontWeight: 'normal', marginTop: 2 }}>
                              {ratingDescriptions[key]}
                            </div>
                          </div>
                        }>
                          <Rate disabled value={value} />
                          <Text style={{ marginLeft: 12 }}>{value} 星</Text>
                        </Descriptions.Item>
                      ))}
                    </Descriptions>
                  </Card>

                  <Card 
                    className="evaluation-detail-card"
                    title="主观评价"
                    style={{ marginBottom: 24 }}
                  >
                    <div style={{ marginBottom: 8 }}>
                      <Text strong>意见与建议</Text>
                    </div>
                    <Paragraph style={{ marginBottom: 0, whiteSpace: 'pre-wrap' }}>
                      {feedback.comments}
                    </Paragraph>
                  </Card>

                  <div style={{ textAlign: 'right', marginBottom: 16, color: '#999', fontSize: 12 }}>
                    提交时间：{new Date(submittedAt).toLocaleString('zh-CN')}
                  </div>
                </>
              );
            })()}
          </>
        ) : (
          <Alert
            message="未找到评价详情"
            description="该课程标记为已评价，但未找到具体的评价内容。这可能是由于历史数据迁移或评价数据丢失导致的。您可以点击下方「补充评价」按钮重新提交评价。"
            type="warning"
            showIcon
            icon={<WarningOutlined />}
            style={{ marginBottom: 24 }}
          />
        )}

        <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
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
            icon={hasEvaluationData ? <EditOutlined /> : <PlusOutlined />} 
            onClick={handleEdit}
            size="large"
            style={{ width: 160, height: 40 }}
          >
            {hasEvaluationData ? '修改评价' : '补充评价'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="evaluation-page">
      <div className="evaluation-back-bar">
        <Button 
          type="link" 
          icon={<ArrowLeftOutlined />} 
          onClick={isEditing ? handleCancelEdit : onBack}
          className="back-button"
        >
          {isEditing ? (hasEvaluationData ? '取消修改' : '取消补充') : '返回课程列表'}
        </Button>
      </div>

      <div style={{ marginBottom: 24, textAlign: 'center' }}>
        <Title level={3}>
          {isEditing 
            ? (hasEvaluationData ? '修改课程评价' : '补充课程评价') 
            : '课程教学质量评价'
          }
        </Title>
        <Typography.Text type="secondary">
          {isEditing 
            ? (hasEvaluationData 
                ? '您可以修改之前的评价内容，修改后点击保存即可更新' 
                : '请补充填写评价内容，提交后将保存为您的评价记录'
              )
            : '请客观、公正地对本学期课程进行评价，您的评价结果将匿名处理。'
          }
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
        {isEditing ? (
          <>
            <Button 
              onClick={handleCancelEdit} 
              size="large" 
              style={{ width: 160, height: 40 }}
              disabled={loading}
            >
              {hasEvaluationData ? '取消' : '取消'}
            </Button>
            <Button 
              type="primary" 
              icon={<SaveOutlined />}
              onClick={form.submit} 
              loading={loading} 
              size="large" 
              style={{ width: 160, height: 40 }}
            >
              {hasEvaluationData ? '保存修改' : '提交评价'}
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
    </div>
  );
};

export default EvaluationPage;
