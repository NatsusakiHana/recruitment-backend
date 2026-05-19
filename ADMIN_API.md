# 后台管理API接口文档

## 认证说明

管理员接口需要在请求头中携带JWT Token：

```
Authorization: Bearer {token}
```

## 管理员认证接口

### 1. 管理员登录

**接口**: `POST /api/admin/login`

**请求参数**:
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**响应**:
```json
{
  "code": 0,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "admin": {
      "id": 1,
      "username": "admin",
      "realName": "系统管理员",
      "role": "super_admin",
      "email": null,
      "phone": null
    }
  },
  "message": "登录成功"
}
```

### 2. 获取当前管理员信息

**接口**: `GET /api/admin/profile`

**需要认证**: 是

**响应**:
```json
{
  "code": 0,
  "data": {
    "id": 1,
    "username": "admin",
    "realName": "系统管理员",
    "role": "super_admin",
    "status": "active",
    "lastLoginAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 3. 管理员登出

**接口**: `POST /api/admin/logout`

**需要认证**: 是

**响应**:
```json
{
  "code": 0,
  "message": "登出成功"
}
```

---

## 通知公告管理接口

### 1. 获取公告列表

**接口**: `GET /api/announcements`

**查询参数**:
- `type`: 类型（notice/announcement）
- `status`: 状态（draft/published）
- `page`: 页码（默认1）
- `pageSize`: 每页数量（默认20）
- `keyword`: 搜索关键词

**响应**:
```json
{
  "code": 0,
  "data": {
    "total": 10,
    "page": 1,
    "pageSize": 20,
    "list": [
      {
        "id": 1,
        "title": "招聘公告",
        "content": "...",
        "type": "announcement",
        "isTop": true,
        "status": "published",
        "publishedAt": "2024-01-01T00:00:00.000Z",
        "viewCount": 100,
        "creator": {
          "id": 1,
          "username": "admin",
          "realName": "系统管理员"
        }
      }
    ]
  }
}
```

### 2. 获取公告详情

**接口**: `GET /api/announcements/:id`

**响应**:
```json
{
  "code": 0,
  "data": {
    "id": 1,
    "title": "招聘公告",
    "content": "...",
    "type": "announcement",
    "isTop": true,
    "status": "published",
    "publishedAt": "2024-01-01T00:00:00.000Z",
    "viewCount": 101,
    "creator": {
      "id": 1,
      "username": "admin",
      "realName": "系统管理员"
    }
  }
}
```

### 3. 创建公告

**接口**: `POST /api/announcements`

**需要认证**: 是

**请求参数**:
```json
{
  "title": "招聘公告",
  "content": "公告内容...",
  "type": "announcement",
  "isTop": false,
  "status": "published"
}
```

**响应**:
```json
{
  "code": 0,
  "data": {
    "id": 1,
    "title": "招聘公告",
    "content": "公告内容...",
    "type": "announcement",
    "isTop": false,
    "status": "published",
    "publishedAt": "2024-01-01T00:00:00.000Z",
    "createdBy": 1
  },
  "message": "创建成功"
}
```

### 4. 更新公告

**接口**: `PUT /api/announcements/:id`

**需要认证**: 是

**请求参数**:
```json
{
  "title": "更新后的标题",
  "content": "更新后的内容",
  "isTop": true,
  "status": "published"
}
```

### 5. 删除公告

**接口**: `DELETE /api/announcements/:id`

**需要认证**: 是

**响应**:
```json
{
  "code": 0,
  "message": "删除成功"
}
```

---

## 轮播图管理接口

### 1. 获取轮播图列表

**接口**: `GET /api/banners`

**查询参数**:
- `status`: 状态（active/inactive）

**响应**:
```json
{
  "code": 0,
  "data": [
    {
      "id": 1,
      "title": "轮播图1",
      "imageUrl": "cloud://xxx",
      "linkUrl": "/pages/detail/detail",
      "sortOrder": 1,
      "status": "active"
    }
  ]
}
```

### 2. 创建轮播图

**接口**: `POST /api/banners`

**需要认证**: 是

**请求参数**:
```json
{
  "title": "轮播图1",
  "imageUrl": "cloud://xxx",
  "linkUrl": "/pages/detail/detail",
  "sortOrder": 1,
  "status": "active"
}
```

### 3. 更新轮播图

**接口**: `PUT /api/banners/:id`

**需要认证**: 是

### 4. 删除轮播图

**接口**: `DELETE /api/banners/:id`

**需要认证**: 是

---

## 单位简介管理接口

### 1. 获取单位简介

**接口**: `GET /api/company-info`

**响应**:
```json
{
  "code": 0,
  "data": {
    "id": 1,
    "content": "单位简介内容...",
    "images": ["cloud://xxx", "cloud://yyy"],
    "updatedBy": 1,
    "updater": {
      "id": 1,
      "username": "admin",
      "realName": "系统管理员"
    }
  }
}
```

### 2. 更新单位简介

**接口**: `PUT /api/company-info`

**需要认证**: 是

**请求参数**:
```json
{
  "content": "更新后的单位简介...",
  "images": ["cloud://xxx", "cloud://yyy"]
}
```

---

## 系统设置接口

### 1. 获取系统设置

**接口**: `GET /api/settings`

**需要认证**: 是

**响应**:
```json
{
  "code": 0,
  "data": {
    "recruitment_start_time": "2024-01-01",
    "recruitment_end_time": "2024-12-31",
    "system_name": "招聘管理系统"
  }
}
```

### 2. 更新系统设置

**接口**: `PUT /api/settings`

**需要认证**: 是

**请求参数**:
```json
{
  "recruitment_start_time": "2024-01-01",
  "recruitment_end_time": "2024-12-31",
  "system_name": "招聘管理系统"
}
```

---

## 统计数据接口

### 1. 获取仪表盘统计数据

**接口**: `GET /api/dashboard/stats`

**需要认证**: 是

**响应**:
```json
{
  "code": 0,
  "data": {
    "totalSubmissions": 100,
    "pendingSubmissions": 20,
    "approvedSubmissions": 60,
    "rejectedSubmissions": 20
  }
}
```

---

## 错误码说明

| 错误码 | 说明 |
|--------|------|
| 0 | 成功 |
| -1 | 失败 |
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 500 | 服务器错误 |

---

## 默认管理员账号

首次启动后端服务时，会自动创建默认管理员账号：

- **用户名**: admin
- **密码**: admin123
- **角色**: super_admin

**⚠️ 生产环境请务必修改默认密码！**
