# 飞书 OAuth 认证配置指南

## 1. 创建飞书自建应用

1. 打开 [飞书开发者后台](https://open.feishu.cn/app)
2. 点击 **创建企业自建应用**
3. 填写应用名称（如 "Mars"），创建完成后进入应用配置

## 2. 配置权限

左侧菜单 → **权限管理** → 添加以下权限：

| 权限 | 说明 |
|------|------|
| `contact:user.base:readonly` | 获取用户基本信息 |
| `contact:user.employee_id:readonly` | 获取用户邮箱/手机 |

## 3. 配置 OAuth 重定向 URI

左侧菜单 → **安全设置** → **OAuth 重定向 URI** → 添加：

```
http://localhost:3000/auth
```

> 生产环境换成实际的域名/IP，如 `http://your-mac-mini-ip:3000/auth`

## 4. 获取 App ID 和 App Secret

左侧菜单 → **凭证与基础信息** → 复制 `App ID` 和 `App Secret`

## 5. 配置到项目

编辑 `Mars/apps/server/.env`：

```env
FEISHU_APP_ID=cli_xxxxx          # 替换为你的 App ID
FEISHU_APP_SECRET=xxxxx           # 替换为你的 App Secret
FEISHU_REDIRECT_URI=http://localhost:3000/auth  # 与飞书后台配置的 URI 一致

JWT_SECRET=mars-jwt-secret-change-in-production  # 生产环境请修改
```

## 6. 版本管理与发布

1. 左侧菜单 → **版本管理与发布** → **创建版本**
2. 填写版本号（如 `1.0.0`）
3. **权限清单** 确认已勾选需要的权限
4. 提交审核 → 审核通过后 **申请发布**

> 注意：只有企业管理员或设置了审批人才能发布应用
