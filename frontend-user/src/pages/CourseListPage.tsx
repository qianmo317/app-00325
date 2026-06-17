import React, { useMemo } from 'react';
import { Card, List, Tag, Avatar, Badge, Empty, Typography, Progress } from 'antd';
import { BookOutlined, UserOutlined, ClockCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { Course, getCourseTypeColor } from '../data/mockData';
import './CourseListPage.css';

const { Text, Title } = Typography;

interface CourseListPageProps {
  courses: Course[];
  onSelectCourse: (course: Course) => void;
}

const CourseListPage: React.FC<CourseListPageProps> = ({ courses, onSelectCourse }) => {
  // 计算评教进度
  const evaluatedCount = courses.filter(c => c.evaluated).length;
  const totalCount = courses.length;
  const progressPercent = totalCount > 0 ? Math.round((evaluatedCount / totalCount) * 100) : 0;

  // 排序课程列表：未评价的优先展示
  const sortedCourses = useMemo(() => {
    return [...courses].sort((a, b) => {
      // 未评价的排在前面
      if (a.evaluated !== b.evaluated) {
        return a.evaluated ? 1 : -1;
      }
      // 相同状态保持原有顺序
      return 0;
    });
  }, [courses]);

  return (
    <div className="course-list-page">
      {/* 页面标题和进度 */}
      <div className="course-list-header">
        <div className="course-list-title-section">
          <Title level={3}>待评教课程</Title>
          <Text type="secondary">
            请对本学期所修课程进行教学质量评价，您的评价将帮助教师改进教学。
          </Text>
        </div>
        
        <Card className="progress-card" size="small">
          <div className="progress-content">
            <div className="progress-info">
              <Text strong>评教进度</Text>
              <Text type="secondary">{evaluatedCount} / {totalCount} 门课程</Text>
            </div>
            <Progress 
              percent={progressPercent} 
              status={progressPercent === 100 ? 'success' : 'active'}
              strokeColor={{
                '0%': '#108ee9',
                '100%': '#87d068',
              }}
            />
          </div>
        </Card>
      </div>

      {/* 课程列表 */}
      {courses.length === 0 ? (
        <Empty description="暂无待评教课程" />
      ) : (
        <List
          className="course-list"
          grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 3, xxl: 3 }}
          dataSource={sortedCourses}
          renderItem={(course) => (
            <List.Item>
              <Badge.Ribbon 
                text={course.evaluated ? '已评价' : '待评价'} 
                color={course.evaluated ? 'green' : 'blue'}
              >
                <Card
                  className={`course-card ${course.evaluated ? 'evaluated' : ''}`}
                  hoverable
                  onClick={() => onSelectCourse(course)}
                >
                  <div className="course-card-content">
                    {/* 课程基本信息 */}
                    <div className="course-main-info">
                      <div className="course-name-row">
                        <BookOutlined className="course-icon" />
                        <span className="course-name">{course.name}</span>
                      </div>
                      <div className="course-code">
                        课程代码：{course.code}
                      </div>
                    </div>

                    {/* 教师信息 */}
                    <div className="teacher-info">
                      <Avatar 
                        src={course.teacher.avatar} 
                        icon={<UserOutlined />}
                        size={48}
                      />
                      <div className="teacher-details">
                        <div className="teacher-name">
                          {course.teacher.name}
                          <Tag color="blue" style={{ marginLeft: 8 }}>{course.teacher.title}</Tag>
                        </div>
                        <div className="teacher-dept">{course.teacher.department}</div>
                      </div>
                    </div>

                    {/* 课程标签 */}
                    <div className="course-tags">
                      <Tag color={getCourseTypeColor(course.type)}>{course.type}</Tag>
                      <Tag icon={<ClockCircleOutlined />}>{course.credits} 学分</Tag>
                      {course.evaluated && (
                        <Tag icon={<CheckCircleOutlined />} color="success">已完成评价</Tag>
                      )}
                    </div>

                    {/* 操作按钮 */}
                    <div className="course-action">
                      <span className="action-text">
                        {course.evaluated ? '查看评价详情 →' : '点击进行评价 →'}
                      </span>
                    </div>
                  </div>
                </Card>
              </Badge.Ribbon>
            </List.Item>
          )}
        />
      )}
    </div>
  );
};

export default CourseListPage;
