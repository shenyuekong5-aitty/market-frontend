# 智慧集市 · 前端

智慧集市是面向用户、小贩、集市管理员和超级管理员的集市管理与购物平台。前端使用 Vue 3、Vite、Vue Router 和 Pinia；组件样式基于项目主题及 Element Plus。公开页面包括平台介绍和“发现好物”，登录后按角色进入相应工作区。

## 本地运行

需要 Node.js，以及同级目录的 `market-backend` 服务。开发代理默认将 `/api`、`/uploads`、`/products`、`/images` 和 `/ws` 转发到 `localhost:8088`，配置见 `vite.config.js`。

```powershell
npm install
npm run dev
```

构建与预览：

```powershell
npm test
npm run build
npm run preview
```

如果后端不在默认地址，可通过 `VITE_API_ORIGIN`、`VITE_API_BASE_URL`、`VITE_WS_ORIGIN` 调整前端运行地址；变量的使用方式见 `src/utils/runtimeConfig.js`。第三方 AI 的密钥只能配置在后端，不能写入前端环境变量或打包资源。

## 页面结构

- `src/layout/Layout.vue` 根据角色选择管理员、小贩或用户布局。
- `src/views/` 存放各业务页面，`src/api/` 存放请求封装，`src/components/` 存放共享组件。
- 手机、平板、PC 的断点与设计约定见 [响应式布局说明](docs/responsive.md)。

## 演示闭环

公开注册可选择普通用户或小贩，未上传头像时由后端提供默认头像。小贩需申请空闲摊位并等待集市管理员审批，获批后才能维护商品。用户订单流程为“待付款 → 模拟付款 → 已付款 → 小贩备货完成 → 待取货 → 用户确认取货 → 已完成”；只有待付款订单可直接取消。当前未接入真实支付和退款渠道，不能把该按钮描述为真实资金结算。

## 智能客服

登录后可通过页面上的“智能客服”入口打开。前端组件位于 `src/components/AiCustomerService.vue`，请求封装位于 `src/api/ai.js`。首次打开时会向后端读取六条常见问题；读取失败时保留前端的默认问题，不影响手动提问。

| 操作 | 接口 | 说明 |
| --- | --- | --- |
| 常见问题 | `GET /api/ai/suggestions` | 返回问题文本数组；需要登录 |
| 发送问题 | `POST /api/ai/chat` | 请求体为 `{"question":"如何申请摊位？","sessionId":null}`；需要登录 |

聊天响应的 `data` 包含 `sessionId`、`answer`、`source`、`providerStatus`。前端会将返回的 `sessionId` 用于下一轮提问；点击“开启新对话”会清除当前会话。`source` 可为 `ai`（第三方模型）、`catalog`（实时商品）、`knowledge`（本地知识库）或 `unknown`（未命中）。`providerStatus` 为 `online`、`not_configured`、`unavailable` 或 `not_needed`，前端据此提示离线模式。

本地知识库不在前端仓库，而在后端的 `src/main/resources/ai/faq.json`。目前包含 62 条常见问答；API 未配置或暂不可用时仍能回答命中的公开操作问题。商品列表优先查询数据库，个人订单和审批状态不会由客服代查。完整接口、回退规则及维护方法见后端仓库的 README。

## 实时通知

通知默认通过 WebSocket `/ws/notification/{userId}` 接收。若 WebSocket 连接中断，前端会自动使用带 Bearer Token 的 `GET /api/notifications/stream` SSE 长连接；WebSocket 恢复后会关闭 SSE，避免重复通知。两种通道只传递 `new_notification` 事件，通知列表和未读数仍通过普通 HTTP 接口查询。
