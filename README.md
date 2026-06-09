# 护理评估平台

面向养老机构、护理员、家属和评估医生的一体化护理评估与管理系统。

## 原始需求

> 建设一个给养老机构、护理员、家属和评估医生使用的护理评估平台，React 页面展示老人档案、护理计划、风险事件和费用明细，Spring Boot 保存护理等级、服务记录、医嘱变化和账单流水。评估医生根据自理能力、认知状态、慢病、跌倒风险和用药情况确定护理等级；护理员记录翻身、喂饭、洗浴、康复训练、夜间巡视和异常事件；家属查看服务记录、请假外出、费用预估和投诉；机构财务按护理等级、增值服务和请假天数结算。系统要把入院评估、护理计划、日常执行、风险上报、等级复评、费用结算连成闭环。跌倒、压疮、走失、家属临时接回要影响护理计划和账单。

## 技术栈

- **前端**: React 18 + TypeScript + Vite + TailwindCSS + Zustand + React Router + Recharts + Lucide React
- **后端**: Spring Boot 3.2 + Java 17 + Maven + Spring Data JPA + Spring Security + JWT
- **数据库**: H2 (开发/演示) / MySQL (生产)
- **认证**: JWT Token，基于角色的访问控制

## 功能模块

| 模块 | 说明 |
|------|------|
| 登录与仪表盘 | 角色登录、角色定制化仪表盘、待办事项、关键指标 |
| 老人档案管理 | 老人基本信息、健康档案、入院记录 |
| 入院评估 | 自理能力、认知状态、慢病、跌倒风险、用药评估、护理等级确定 |
| 护理计划管理 | 计划制定与调整、风险事件联动变更 |
| 日常护理记录 | 翻身、喂饭、洗浴、康复训练、夜间巡视、异常事件上报 |
| 风险事件管理 | 跌倒、压疮、走失、家属接回，影响护理计划与账单 |
| 等级复评 | 定期复评提醒、等级变更与计划联动 |
| 费用结算 | 按护理等级计费、增值服务、请假扣减、账单生成 |
| 家属门户 | 服务记录查看、请假外出、费用预估、投诉建议 |

## 演示账号

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 管理员 | admin | admin123 |
| 评估医生 | doctor1 | doc123 |
| 护理员 | caregiver1 | care123 |
| 家属 | family1 | fam123 |

## 启动方式

### 前置要求

- Java 17+
- Node.js 20+
- Maven 3.8+ (或使用项目自带 wrapper)
- Docker & Docker Compose (可选，用于容器化启动)

### Docker 一键启动 (推荐)

```bash
docker compose up --build
```

如需后台运行:

```bash
docker compose up --build -d
```

停止并清理服务:

```bash
docker compose down
```

访问地址:

- 前端: http://localhost:3000
- 后端 API: http://localhost:8080/api
- H2 控制台: http://localhost:8080/h2-console

### 手动启动

#### 1. 启动后端

```bash
cd backend
mvn spring-boot:run
```

后端启动在 http://localhost:8080

#### 2. 安装前端依赖

```bash
cd frontend
npm install
```

#### 3. 启动前端

```bash
cd frontend
npm run dev
```

前端访问地址: http://localhost:5173

## 项目结构

```
├── backend/                    # Spring Boot 后端
│   ├── src/main/java/com/nursing/
│   │   ├── config/             # 配置 (CORS, Security, DataInitializer)
│   │   ├── controller/         # REST 控制器
│   │   ├── dto/                # 数据传输对象
│   │   ├── entity/             # JPA 实体
│   │   ├── repository/         # 数据访问层
│   │   ├── security/           # JWT 过滤器
│   │   ├── service/            # 业务逻辑层
│   │   └── util/               # 工具类
│   ├── Dockerfile
│   └── pom.xml
├── frontend/                   # React 前端
│   ├── src/
│   │   ├── components/         # 公共组件
│   │   ├── pages/              # 页面组件
│   │   │   ├── dashboard/      # 仪表盘
│   │   │   └── elder/          # 老人详情子标签页
│   │   ├── store/              # Zustand 状态管理
│   │   ├── types/              # TypeScript 类型定义
│   │   └── utils/              # 工具函数和常量
│   ├── Dockerfile
│   └── package.json
├── Dockerfile                  # 根目录 Dockerfile (构建全栈应用)
├── docker-compose.yml          # Docker Compose 编排
└── .dockerignore
```

## 核心闭环流程

1. **入院评估** → 评估医生根据自理能力、认知状态、慢病、跌倒风险、用药情况评定护理等级
2. **生成护理计划** → 系统根据等级自动生成护理计划
3. **日常护理执行** → 护理员按计划执行并记录
4. **风险事件上报** → 跌倒/压疮/走失/家属接回触发计划调整和费用影响
5. **等级复评** → 定期复评更新等级，联动护理计划
6. **费用结算** → 按护理等级、增值服务、请假天数、风险调整结算
