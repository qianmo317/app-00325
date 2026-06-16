# 学生评教系统

## 1 如何运行

### 前置要求
- **Docker 方式**：Docker、Docker Compose
- **本地开发方式**：Node.js 18+、npm 或 yarn

### Docker 启动方式（生产环境推荐）

1. 克隆仓库
2. 进入项目根目录
3. 运行以下命令启动应用：
   ```bash
   docker-compose up --build -d
   ```
4. 在浏览器中访问：`http://localhost:8081`

#### Docker 跨平台构建说明

本项目使用 Alpine Linux 基础镜像（`node:18-alpine` 和 `nginx:alpine`），天然支持 ARM 和 X86 架构。

**构建多平台镜像：**
```bash
# 使用 Docker Buildx 构建多平台镜像
docker buildx create --use
docker buildx build --platform linux/amd64,linux/arm64 -t frontend-user:latest ./frontend-user

# 或者使用 docker-compose 构建
docker-compose build --platform linux/amd64,linux/arm64
```

**验证平台支持：**
```bash
# 检查镜像支持的平台
docker buildx imagetools inspect frontend-user:latest
```

### 本地开发环境启动方式

1. 克隆仓库
2. 进入 frontend-user 目录：
   ```bash
   cd frontend-user
   ```
3. 安装依赖：
   ```bash
   npm install
   ```
4. 启动开发服务器：
   ```bash
   npm run dev
   ```
5. 在浏览器中访问：`http://localhost:5173` (Vite 默认端口)

**开发环境命令：**
- `npm run dev` - 启动开发服务器（支持热更新）
- `npm run build` - 构建生产版本
- `npm run preview` - 预览生产构建
- `npm run lint` - 运行 ESLint 检查

## 2 服务

| 服务名称 | 端口 | 描述 |
| :--- | :--- | :--- |
| frontend-user | 8081 | 学生评教前端（React + Vite + Nginx） |

## 3 测试账号

| 用户名 | 密码 | 说明 |
| :--- | :--- | :--- |
| student | 123456 | 演示学生账号 |

登录后可查看课程列表并进行评教。

## 4 题目内容

**项目需求：**
集成 form-render，创建一个学生评教的功能页面，使用 json schema 方式将预设好的表单渲染显示出来，学生填写后进行提交。

**项目要求：**
1. 必须提供 README.md，包含 How to Run, Services, 测试账号, 题目内容。
2. 编写一个 Dockerfile（包含编译过程、基础镜像跨平台支持 ARM/X86）。
3. 前端项目的对外映射端口为 8081。
4. 根目录增加 docker-compose.yml 和 .gitignore 和 README.md。
5. 项目目录清晰，禁止逻辑堆在单一文件。
6. 视觉分层：通过背景色、卡片阴影、边框区分功能区。
7. 布局与对齐：遵守栅格或 Flex 布局，间距统一。
8. 渲染完整性：图片占位符，图标无破损。
9. 交互反馈：按钮 Hover/Loading，操作 Toast/Message。
10. 风格统一：字体颜色、字号、圆角风格保持一致。

## 5 功能说明

### 主要功能

1. **用户登录/退出**
   - 登录页面：用户名密码登录
   - 登录验证与错误提示
   - 用户头像和下拉菜单
   - 退出登录功能

2. **课程列表页面**
   - 展示学生本学期所有待评教课程
   - 显示评教进度（已完成/总数）
   - 课程卡片展示：课程名称、课程代码、任课教师、学分、课程类型
   - 已评价课程显示"已评价"标记，防止重复评价

3. **课程/教师切换**
   - 支持多门课程切换评价
   - 每门课程独立跟踪评价状态
   - 点击课程卡片进入评价页面

4. **评教表单页面**
   - 使用 form-render 渲染 JSON Schema 定义的表单
   - 评分维度：教学态度、教学内容、教学方法、课堂互动
   - 主观评价：意见与建议（文本域）
   - 表单验证与友好提示

5. **交互体验**
   - 返回按钮：从评价页面返回课程列表
   - 提交成功后显示结果页面
   - 按钮 Loading 状态
   - 操作成功/失败 Toast 提示

### 模拟数据

系统内置 5 门模拟课程和 5 位模拟教师，用于演示功能：
- 高等数学 (A) - 王建国教授
- 数据结构与算法 - 李明华副教授
- 大学英语 (三) - 张晓红讲师
- 大学物理 - 陈伟强教授
- 思想道德与法治 - 刘芳副教授

## 6 技术说明与代码注释

### 代码实现说明

#### 表单 Label 关联修复（EvaluationPage.tsx）

项目中包含一个 `useEffect` 钩子用于修复 form-render 生成的表单中 label 的 `for` 属性与表单字段 `id` 不匹配的问题。这是针对 form-render 库的临时解决方案，确保：

- 浏览器自动填充功能正常工作
- 辅助功能工具（屏幕阅读器等）能够正确识别表单字段
- 符合 Web 无障碍访问标准（WCAG）

**实现位置：** `frontend-user/src/pages/EvaluationPage.tsx` (第 22-69 行)

**工作原理：**
1. 组件挂载后延迟执行，确保 DOM 已完全渲染
2. 查找所有表单项，检查 label 和 input 的关联关系
3. 自动生成或修复 `id` 和 `for` 属性，确保它们匹配
4. 使用 MutationObserver 监听 DOM 变化，动态修复新添加的表单字段

#### API 调用模拟

当前版本为前端演示版本，表单提交功能使用 `setTimeout` 模拟 API 调用延迟（1.5秒）。

**实现位置：** `frontend-user/src/pages/EvaluationPage.tsx` (第 71-84 行)

**接入真实 API 的方式：**
```typescript
// 替换模拟代码
const onFinish = async (values: any) => {
  setLoading(true);
  try {
    // 使用 axios 或其他 HTTP 客户端
    const response = await axios.post('/api/evaluation/submit', values);
    message.success('提交成功！感谢您的评价');
    setSubmitted(true);
  } catch (error) {
    message.error('提交失败，请稍后重试');
  } finally {
    setLoading(false);
  }
};
```

### 日志记录

当前项目使用简单的 `console.log` 记录表单提交值，主要用于开发调试。

**当前实现：** `frontend-user/src/pages/EvaluationPage.tsx` (第 76 行)

**生产环境建议：**
- 集成专业的日志服务（如 Sentry、LogRocket）
- 使用结构化日志格式（JSON）
- 区分日志级别（info、warn、error）
- 避免在前端记录敏感信息（如用户密码）

**示例改进：**
```typescript
import * as Sentry from '@sentry/react';

const onFinish = async (values: any) => {
  setLoading(true);
  try {
    const response = await axios.post('/api/evaluation/submit', values);
    
    // 记录成功日志
    Sentry.addBreadcrumb({
      category: 'evaluation',
      message: 'Evaluation submitted successfully',
      level: 'info',
    });
    
    message.success('提交成功！感谢您的评价');
    setSubmitted(true);
  } catch (error) {
    // 记录错误日志
    Sentry.captureException(error, {
      tags: { component: 'EvaluationPage' },
      extra: { formValues: values },
    });
    message.error('提交失败，请稍后重试');
  } finally {
    setLoading(false);
  }
};
```

---

## 项目结构

```
label-00325/
├── README.md           # 项目文档
├── docker-compose.yml  # Docker Compose 配置
├── .gitignore          # Git 忽略文件
└── frontend-user/      # 前端应用代码
    ├── Dockerfile      # Docker 构建文件
    ├── .dockerignore   # Docker 忽略文件
    ├── nginx.conf      # Nginx 配置
    ├── package.json
    ├── vite.config.ts
    └── src/
        ├── components/     # 共享组件
        │   ├── MainLayout.tsx      # 主布局组件
        │   ├── CourseInfoCard.tsx  # 课程信息卡片
        │   └── CourseInfoCard.css
        ├── pages/          # 页面组件
        │   ├── LoginPage.tsx       # 登录页面
        │   ├── LoginPage.css
        │   ├── CourseListPage.tsx  # 课程列表页面
        │   ├── CourseListPage.css
        │   ├── EvaluationPage.tsx  # 评教表单页面
        │   └── EvaluationPage.css
        ├── schema/         # 表单模式定义
        │   └── evaluationSchema.ts # 评教表单 JSON Schema
        ├── data/           # 模拟数据
        │   └── mockData.ts # 用户、课程和教师数据
        ├── App.tsx         # 应用入口（状态管理）
        ├── main.tsx        # React 根组件
        └── index.css       # 全局样式
```
