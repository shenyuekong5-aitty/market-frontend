<template>
  <div class="not-found-container">
    <!-- 背景装饰 -->
    <div class="bg-decoration">
      <div class="bg-ornament bg-ornament-1"></div>
      <div class="bg-ornament bg-ornament-2"></div>
    </div>

    <div class="not-found-card">
      <div class="icon-wrapper">
        <div class="icon-circle">
          <span class="icon-emoji">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
          </span>
        </div>
      </div>
      <h1>404</h1>
      <p class="title">页面未找到</p>
      <p class="description">抱歉，您访问的页面不存在或已被移除</p>
      <div class="actions">
        <router-link to="/" class="btn-primary">返回首页</router-link>
        <button class="btn-outline" @click="goBack">返回上一页</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function goBack() {
  router.back()
}
</script>

<style scoped>
/* ============================================================
   1. 设计 Token
   ============================================================ */
.not-found-container {
  --text: var(--ink-strong);
  --text-secondary: var(--ink);
  --text-muted: var(--ink-muted);
  --accent: var(--brand-primary);
  --accent-light: var(--brand-primary-soft);
  --shadow: var(--shadow-md);
  --radius: var(--radius-lg);

  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100dvh;
  background: var(--surface-page);
  padding: 20px;
  position: relative;
  overflow: hidden;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

/* ============================================================
   2. 背景装饰
   ============================================================ */
.bg-decoration {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.bg-ornament {
  position: absolute;
  border-radius: 50%;
  background: rgba(201, 125, 74, 0.04);
}

.bg-ornament-1 {
  width: 500px;
  height: 500px;
  top: -150px;
  right: -100px;
}

.bg-ornament-2 {
  width: 400px;
  height: 400px;
  bottom: -150px;
  left: -100px;
  background: rgba(201, 125, 74, 0.03);
}

/* ============================================================
   3. 404 卡片
   ============================================================ */
.not-found-card {
  position: relative;
  z-index: 1;
  width: 480px;
  max-width: 100%;
  padding: 52px 48px 44px;
  background: #ffffff;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  text-align: center;
  transition: transform 0.3s ease;
}

/* ============================================================
   4. 图标
   ============================================================ */
.icon-wrapper {
  margin-bottom: 20px;
}

.icon-circle {
  width: 88px;
  height: 88px;
  margin: 0 auto;
  border-radius: 50%;
  background: var(--accent-light);
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-emoji {
  font-size: 40px;
  line-height: 1;
}

/* ============================================================
   5. 文字
   ============================================================ */
h1 {
  font-size: 72px;
  color: var(--text);
  margin: 0 0 6px 0;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.1;
}

.title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 8px 0;
}

.description {
  font-size: 0.95rem;
  color: var(--text-secondary);
  margin: 0 0 32px 0;
}

/* ============================================================
   6. 按钮
   ============================================================ */
.actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-primary {
  display: inline-block;
  padding: 10px 28px;
  border-radius: 100px;
  background: var(--text);
  border: none;
  font-weight: 500;
  font-size: 0.9rem;
  color: #fff;
  cursor: pointer;
  text-decoration: none;
  transition: background 0.25s, transform 0.2s;
}

.btn-primary:hover {
  background: var(--accent);
}

.btn-primary:active {
  transform: scale(0.97);
}

.btn-outline {
  padding: 10px 28px;
  border-radius: 100px;
  background: transparent;
  border: 1px solid var(--line);
  font-weight: 500;
  font-size: 0.9rem;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.25s;
}

.btn-outline:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-light);
}

.btn-outline:active {
  transform: scale(0.97);
}

/* ============================================================
   7. 响应式适配
   ============================================================ */

/* ---- 移动端（< 768px） ---- */
@media (max-width: 767px) {
  .not-found-container {
    padding: 16px;
    align-items: center;
    min-height: 100dvh;
  }

  .bg-ornament-1 {
    width: 300px;
    height: 300px;
    top: -80px;
    right: -60px;
  }

  .bg-ornament-2 {
    width: 250px;
    height: 250px;
    bottom: -80px;
    left: -60px;
  }

  .not-found-card {
    padding: 32px 20px 28px;
    border-radius: 20px;
    margin: auto 0;
  }

  .icon-circle {
    width: 72px;
    height: 72px;
  }

  .icon-emoji {
    font-size: 32px;
  }

  h1 {
    font-size: 52px;
  }

  .title {
    font-size: 17px;
  }

  .description {
    font-size: 0.85rem;
    margin-bottom: 24px;
  }

  .actions {
    flex-direction: column;
    gap: 10px;
  }

  .btn-primary,
  .btn-outline {
    width: 100%;
    padding: 12px 20px;
    font-size: 0.95rem;
    text-align: center;
  }
}

/* ---- 平板端（768px ~ 1024px） 修复卡片靠下问题 ---- */
@media (min-width: 768px) and (max-width: 1024px) {
  .not-found-container {
    min-height: 100dvh;
    padding: 20px;
    align-items: center;
  }

  .not-found-card {
    padding: 40px 36px 32px;
    margin-top: -5vh;
  }

  .bg-ornament-1 {
    width: 350px;
    height: 350px;
    top: -100px;
    right: -80px;
  }

  .bg-ornament-2 {
    width: 280px;
    height: 280px;
    bottom: -100px;
    left: -80px;
  }

  .icon-circle {
    width: 80px;
    height: 80px;
  }

  h1 {
    font-size: 64px;
  }
}

/* ---- 小屏平板竖屏（768px ~ 820px）额外优化 ---- */
@media (min-width: 768px) and (max-width: 820px) and (orientation: portrait) {
  .not-found-card {
    padding: 28px 24px 24px;
    margin-top: -8vh;
  }

  .icon-circle {
    width: 64px;
    height: 64px;
  }

  .icon-emoji {
    font-size: 28px;
  }

  h1 {
    font-size: 48px;
  }

  .title {
    font-size: 16px;
  }
}

/* ---- 大屏平板横屏（1024px ~ 1366px）微调 ---- */
@media (min-width: 1025px) and (max-width: 1366px) and (orientation: landscape) {
  .not-found-card {
    margin-top: -3vh;
  }

  .bg-ornament-1 {
    width: 400px;
    height: 400px;
    top: -120px;
    right: -80px;
  }

  .bg-ornament-2 {
    width: 320px;
    height: 320px;
    bottom: -120px;
    left: -80px;
  }
}

/* ---- 桌面端（≥ 1025px） ---- */
@media (min-width: 1025px) {
  .not-found-card {
    padding: 52px 48px 44px;
    margin-top: 0;
  }
}
</style>
