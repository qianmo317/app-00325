import { useState, useEffect } from 'react';
import { ConfigProvider, App as AntdApp } from 'antd';
import MainLayout from './components/MainLayout';
import EvaluationPage from './pages/EvaluationPage';
import CourseListPage from './pages/CourseListPage';
import LoginPage from './pages/LoginPage';
import { courses as initialCourses, Course, User } from './data/mockData';

// localStorage 键名
const STORAGE_KEYS = {
  USER: 'evaluation_user',
  COURSES: 'evaluation_courses',
};

// 从 localStorage 获取初始用户状态
const getInitialUser = (): User | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.USER);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

// 从 localStorage 获取初始课程状态
const getInitialCourses = (): Course[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.COURSES);
    return stored ? JSON.parse(stored) : initialCourses;
  } catch {
    return initialCourses;
  }
};

// 内部应用组件，使用 useApp hook 获取 message 实例
function AppContent() {
  const { message } = AntdApp.useApp();
  
  // 用户认证状态（从 localStorage 初始化）
  const [user, setUser] = useState<User | null>(getInitialUser);
  // 课程列表状态（从 localStorage 初始化）
  const [courses, setCourses] = useState<Course[]>(getInitialCourses);
  // 当前选中的课程
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // 同步用户状态到 localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  }, [user]);

  // 同步课程状态到 localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
  }, [courses]);

  // 登录成功处理
  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    // 检查是否有已保存的课程状态，如果没有则重置
    const storedCourses = localStorage.getItem(STORAGE_KEYS.COURSES);
    if (!storedCourses) {
      setCourses(initialCourses.map(course => ({ ...course, evaluated: false })));
    }
  };

  // 退出登录处理
  const handleLogout = () => {
    setUser(null);
    setSelectedCourse(null);
    // 清除 localStorage 中的用户数据
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.COURSES);
    // 重置课程状态
    setCourses(initialCourses.map(course => ({ ...course, evaluated: false })));
    message.success('已成功退出登录');
  };

  // 选择课程进行评价
  const handleSelectCourse = (course: Course) => {
    setSelectedCourse(course);
  };

  // 返回课程列表
  const handleBack = () => {
    setSelectedCourse(null);
  };

  // 评价提交成功后更新课程状态
  const handleSubmitSuccess = (courseId: string) => {
    setCourses(prevCourses =>
      prevCourses.map(course =>
        course.id === courseId ? { ...course, evaluated: true } : course
      )
    );
  };

  return user ? (
    <MainLayout user={user} onLogout={handleLogout}>
      {selectedCourse ? (
        <EvaluationPage
          course={selectedCourse}
          onBack={handleBack}
          onSubmitSuccess={handleSubmitSuccess}
        />
      ) : (
        <CourseListPage
          courses={courses}
          onSelectCourse={handleSelectCourse}
        />
      )}
    </MainLayout>
  ) : (
    <LoginPage onLoginSuccess={handleLoginSuccess} />
  );
}

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 6,
        },
      }}
    >
      <AntdApp>
        <AppContent />
      </AntdApp>
    </ConfigProvider>
  );
}

export default App;
