# Mars

全栈项目，基于 pnpm monorepo 架构。

| 包名 | 路径 | 说明 |
|------|------|------|
| `@mars/server` | `apps/server/` | 后端服务 (NestJS) |
| `@mars/web` | `apps/web/` | 前端应用 (React + Vite) |
| `@mars/shared` | `packages/shared/` | 共享类型定义 |

## 版本规则

遵循语义化版本 [SemVer](https://semver.org/)：

| 版本类型 | 示例 | 说明 | npm 命令 |
|---------|------|------|---------|
| **patch** | `0.0.1` → `0.0.2` | 小改动、修 bug | `npm version patch` |
| **minor** | `0.1.0` → `0.2.0` | 新增功能、小特性 | `npm version minor` |
| **major** | `1.0.0` → `2.0.0` | 破坏性变更、大版本 | `npm version major` |

## 发布流程

### 一键打版（推荐）

ESLint 检查 → 打版 → 自动提交，一条命令完成：

```bash
# ── 全部打版 ──
pnpm release:all:patch     # 小版本
pnpm release:all:minor     # 中版本
pnpm release:all:major     # 大版本

# ── 单独打版 ──
pnpm release:server:patch  # 仅 server
pnpm release:web:patch     # 仅 web
# 同样支持 minor / major
```

### 手动打版

```bash
# 手动打版
pnpm version:all:patch     # server + web
pnpm version:server:patch  # 仅 server
pnpm version:web:patch     # 仅 web

# 手动提交
git add apps
git commit -m "chore: bump all version (patch)"
```

### 触发部署

```bash
git push origin main
```

GitHub Actions CD 工作流会自动检测 `apps/server/package.json` 和 `apps/web/package.json` 的版本变化：

- 只有 **server 版本变更** → 只构建部署 `@mars/server`
- 只有 **web 版本变更** → 只构建部署 `@mars/web`
- **两者都变** → 同时构建部署
- 支持手动触发 (`workflow_dispatch`)，可选择部署目标
