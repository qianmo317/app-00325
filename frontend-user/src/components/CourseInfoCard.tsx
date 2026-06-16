import React from 'react';
import { Card, Row, Col } from 'antd';
import { BookOutlined, UserOutlined, CalendarOutlined } from '@ant-design/icons';
import './CourseInfoCard.css';

interface CourseInfo {
  courseName: string;
  teacherName: string;
  semester: string;
}

interface CourseInfoCardProps {
  courseInfo: CourseInfo;
}

const CourseInfoCard: React.FC<CourseInfoCardProps> = ({ courseInfo }) => {
  const infoItems = [
    {
      icon: <BookOutlined />,
      label: '课程名称',
      value: courseInfo.courseName,
    },
    {
      icon: <UserOutlined />,
      label: '任课教师',
      value: courseInfo.teacherName,
    },
    {
      icon: <CalendarOutlined />,
      label: '学期',
      value: courseInfo.semester,
    },
  ];

  return (
    <Card className="course-info-card" variant="borderless">
      <div className="course-info-header">
        <div className="course-info-title-wrapper">
          <div className="course-info-title-accent"></div>
          <h3 className="course-info-title">课程信息</h3>
        </div>
      </div>
      <Row gutter={[20, 20]}>
        {infoItems.map((item, index) => (
          <Col xs={24} sm={8} key={index}>
            <div className="course-info-item">
              <div className="course-info-item-icon-wrapper">
                {item.icon}
              </div>
              <div className="course-info-item-content">
                <div className="course-info-label">{item.label}</div>
                <div className="course-info-value">{item.value}</div>
              </div>
            </div>
          </Col>
        ))}
      </Row>
    </Card>
  );
};

export default CourseInfoCard;
