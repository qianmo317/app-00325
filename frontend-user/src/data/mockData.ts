/**
 * 模拟数据 - 用户、课程和教师信息
 * 
 * 说明：这是用于前端演示的模拟数据。
 * 实际项目中应从后端 API 获取这些数据。
 */

// 用户（学生）信息接口
export interface User {
  id: string;
  username: string;
  name: string;
  studentId: string;
  major: string;
  grade: string;
  avatar: string;
}

export interface Teacher {
  id: string;
  name: string;
  title: string;
  avatar: string;
  department: string;
}

export interface EvaluationData {
  ratings: {
    teachingAttitude: number;
    teachingContent: number;
    teachingMethod: number;
    interaction: number;
  };
  feedback: {
    comments: string;
  };
  submittedAt?: string;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  teacher: Teacher;
  semester: string;
  credits: number;
  type: '必修' | '选修' | '公选';
  evaluated: boolean;
  evaluationData?: EvaluationData;
}

// 模拟教师数据
// 头像使用 Unsplash 无版权图片
export const teachers: Teacher[] = [
  {
    id: 't1',
    name: '王建国',
    title: '教授',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    department: '数学与统计学院',
  },
  {
    id: 't2',
    name: '李明华',
    title: '副教授',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    department: '计算机科学学院',
  },
  {
    id: 't3',
    name: '张晓红',
    title: '讲师',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    department: '外国语学院',
  },
  {
    id: 't4',
    name: '陈伟强',
    title: '教授',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
    department: '物理学院',
  },
  {
    id: 't5',
    name: '刘芳',
    title: '副教授',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
    department: '马克思主义学院',
  },
];

// 模拟课程数据
export const courses: Course[] = [
  {
    id: 'c1',
    name: '高等数学 (A)',
    code: 'MATH101',
    teacher: teachers[0],
    semester: '2025-2026 第一学期',
    credits: 5,
    type: '必修',
    evaluated: false,
  },
  {
    id: 'c2',
    name: '数据结构与算法',
    code: 'CS201',
    teacher: teachers[1],
    semester: '2025-2026 第一学期',
    credits: 4,
    type: '必修',
    evaluated: false,
  },
  {
    id: 'c3',
    name: '大学英语 (三)',
    code: 'ENG301',
    teacher: teachers[2],
    semester: '2025-2026 第一学期',
    credits: 3,
    type: '必修',
    evaluated: false,
  },
  {
    id: 'c4',
    name: '大学物理',
    code: 'PHY101',
    teacher: teachers[3],
    semester: '2025-2026 第一学期',
    credits: 4,
    type: '必修',
    evaluated: false,
  },
  {
    id: 'c5',
    name: '思想道德与法治',
    code: 'POL101',
    teacher: teachers[4],
    semester: '2025-2026 第一学期',
    credits: 3,
    type: '公选',
    evaluated: false,
  },
];

// 获取课程类型标签颜色
export const getCourseTypeColor = (type: Course['type']): string => {
  const colors = {
    '必修': '#f50',
    '选修': '#2db7f5',
    '公选': '#87d068',
  };
  return colors[type] || '#108ee9';
};
