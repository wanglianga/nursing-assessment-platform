# 养老评估平台后端

## 原始需求

> Create a complete Spring Boot 3.2 backend project in d:\code\solocode-wl\wl-279\backend for a nursing assessment platform.
> IMPORTANT: Create ALL files from scratch. The backend directory is currently empty.

## 项目简介

养老评估平台后端服务，基于 Spring Boot 3.2 构建，提供老人管理、护理评估、护理方案、风险事件、账单管理、家属端等核心功能。

## 技术栈

- Java 17
- Spring Boot 3.2.5
- Spring Data JPA
- Spring Security + JWT
- H2 内存数据库
- Lombok
- Maven

## 启动方式

### 前置要求

- Java 17+
- Maven 3.8+

### Docker 一键启动（优先）

```bash
docker compose up --build
```

后台运行：

```bash
docker compose up --build -d
```

停止服务：

```bash
docker compose down
```

访问地址：http://localhost:8080

### 手动启动

#### 1. 安装依赖

```bash
cd backend
mvn clean install -DskipTests
```

#### 2. 启动服务

```bash
mvn spring-boot:run
```

访问地址：http://localhost:8080

H2 控制台：http://localhost:8080/h2-console（JDBC URL: jdbc:h2:mem:nursingdb，用户名: sa，密码: 空）

## 默认用户

| 用户名    | 密码     | 角色      | 姓名   |
|-----------|----------|-----------|--------|
| admin     | admin123 | ADMIN     | 张管理 |
| doctor1   | doc123   | DOCTOR    | 李医生 |
| caregiver1| care123  | CAREGIVER | 王护理 |
| family1   | fam123   | FAMILY    | 赵家属 |

## API 接口

所有接口前缀为 `/api`，需要 JWT 认证（`/api/auth/**` 除外）。

### 认证
- `POST /api/auth/login` - 登录获取 Token

### 老人管理
- `GET /api/elders` - 获取所有老人
- `GET /api/elders/{id}` - 获取老人详情
- `POST /api/elders` - 新增老人
- `PUT /api/elders/{id}` - 更新老人
- `GET /api/elders/stats` - 获取统计信息

### 评估
- `POST /api/assessments` - 创建评估
- `GET /api/assessments/elder/{elderId}` - 获取老人评估列表

### 护理方案
- `GET /api/care-plans/elder/{elderId}` - 获取老人护理方案
- `POST /api/care-plans/elder/{elderId}/items` - 添加护理项目
- `PUT /api/care-plans/items/{id}` - 更新护理项目
- `POST /api/care-plans/{id}/changes` - 添加变更记录
- `PUT /api/care-plans/{id}/status` - 更新方案状态

### 护理记录
- `GET /api/care-records/elder/{elderId}` - 获取老人护理记录
- `GET /api/care-records/caregiver/{caregiverId}` - 获取护理员记录
- `POST /api/care-records` - 创建护理记录
- `GET /api/care-records/stats/today` - 今日统计

### 风险事件
- `GET /api/risk-events` - 获取所有风险事件
- `GET /api/risk-events/{id}` - 获取风险事件详情
- `POST /api/risk-events` - 创建风险事件
- `POST /api/risk-events/{id}/handling` - 添加处理记录
- `PUT /api/risk-events/{id}/status` - 更新状态

### 账单
- `GET /api/bills` - 获取所有账单
- `GET /api/bills/elder/{elderId}` - 获取老人账单
- `GET /api/bills/{id}` - 获取账单详情
- `POST /api/bills/generate/{period}` - 生成账单
- `PUT /api/bills/{id}/status` - 更新账单状态

### 家属端
- `GET /api/family/{familyMemberId}/elders` - 获取关联老人
- `GET /api/family/{familyMemberId}/records/{elderId}` - 获取护理记录
- `GET /api/family/{familyMemberId}/leave-requests` - 获取请假申请
- `POST /api/family/{familyMemberId}/leave-requests` - 创建请假申请
- `PUT /api/family/leave-requests/{id}/approve` - 批准请假
- `PUT /api/family/leave-requests/{id}/reject` - 拒绝请假
- `GET /api/family/{familyMemberId}/complaints` - 获取投诉
- `POST /api/family/{familyMemberId}/complaints` - 创建投诉
- `PUT /api/family/complaints/{id}/resolve` - 解决投诉
