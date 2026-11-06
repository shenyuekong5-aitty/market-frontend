# 界面改版说明

本次覆盖 `src/views` 下全部 31 个页面组件，以及工作区导航、公共导航、品牌、登录布局、弹窗、空状态和客服展示。

## 视觉参考

- [Linear：A calmer interface for a product in motion](https://linear.app/now/behind-the-latest-design-refresh)：降低导航权重，区分定位信息、标题与工作内容。
- [shadcn/ui Dashboard](https://ui.shadcn.com/examples/dashboard)：统一内容边距、数据卡片、表格和筛选工具。
- [Shopify Admin redesign](https://www.shopify.com/blog/admin-new-look)：可折叠侧栏与围绕日常经营组织的工作区。

采用深绿侧栏、米灰页面底色、白色内容面板和克制的状态色。以 8px 为基础处理间距与圆角，正文、元信息、标题和金额有固定层级。公共页面使用集市实景图片；工作区使用清晰的数据与操作结构。

## 结构

- `src/layout/WorkspaceShell.vue`：四种角色共享工作区，按现有角色路由生成导航。手机菜单包含完整功能入口，底栏保留常用入口。
- `src/layout/AuthLayout.vue`：登录与注册共享分栏布局，手机端展示单栏表单。
- `src/components/BrandLogo.vue`、`PublicHeader.vue`、`PublicFooter.vue`：公共页面统一品牌与导航。
- `src/components/PageHeading.vue`：所有业务页面共用标题、说明与操作区。
- `src/components/CollectionToolbar.vue`、`src/composables/useCollectionSearch.js`：本地列表搜索，保留原数据与业务操作。公开橱窗支持已加载商品的价格排序，搜索范围在输入提示中明确说明。
- `src/styles/tokens.css`：唯一的基础配色与尺寸变量；同时对齐 Element Plus 变量。
- `src/styles/theme.css`：表单、表格、消息提示和确认框基础样式。
- `src/styles/workspace-pages.css`：各类业务页面布局，替代旧页面中重复的设备样式和 consumer 覆盖层。
- `src/components/StatusPage.vue`：403 与 404 的统一布局。

## 页面覆盖

| 范围 | 页面 |
| --- | --- |
| 公共页面 | 首页、发现好物、平台介绍、登录、注册、403、404 |
| 用户端 | 集市列表、集市详情、摊位详情、购物车、订单、预订、关注、消息 |
| 商户端 | 工作台、入驻选择、摊位编辑、商品、订单、预订、收入 |
| 管理端 | 运营概览、集市管理、摊位管理、操作日志、收入分析、消息、管理员管理、全平台审批 |
| 共享页面 | 个人中心，根据四种角色显示对应内容 |

## 验证

- `npm run build` 通过。
- 四种角色共 29 个页面视图（含跨角色共享视图）在 1440×1000 和 390×844 下进行渲染检查，未发现整页或主内容区横向溢出、坏图或页面控制台错误。
- 上述 29 个视图另外使用空数据检查手机布局。
- 检查首页、介绍、商品橱窗、登录、注册与异常页的公共布局。
- 验证订单状态搜索、无匹配提示、清空搜索、公开商品价格排序、手机导航、新增商品弹窗、键盘焦点约束和客服面板。
- 收入图表随所在面板尺寸变化重新排版，卸载时释放图表和观察器。

工作区 UI 使用临时的内存模拟数据入口检查，所有写请求被阻止，入口在验证后删除。公开商品搜索及排序另用真实公开只读接口验证。未执行真实付款、审批、修改账号或保存商品等操作；服务端权限和交易流程保持原实现。

构建仍有依赖包注释与大体积 chunk 提示，不影响此次构建成功。
