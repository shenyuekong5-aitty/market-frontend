<template>
  <div class="ai-service" @keydown.esc="opened = false">
    <section v-if="opened" class="ai-panel" aria-label="智慧集市客服">
      <header class="ai-header">
        <div class="ai-avatar" aria-hidden="true">✦</div>
        <div class="ai-heading">
          <span class="ai-overline">MARKET ASSISTANT</span>
          <strong>集市小助手</strong>
          <span class="ai-availability"><i aria-hidden="true"></i> 随时为你解答</span>
        </div>
        <button class="icon-button" type="button" title="开启新对话" aria-label="开启新对话" @click="resetChat">↺</button>
        <button class="icon-button" type="button" title="关闭客服" aria-label="关闭客服" @click="opened = false">×</button>
      </header>

      <div ref="scrollBox" class="ai-messages" aria-live="polite">
        <div v-if="!messages.length" class="ai-welcome">
          <div class="welcome-icon" aria-hidden="true">✦</div>
          <span class="welcome-kicker">你好，欢迎来到智慧集市</span>
          <h2>想了解什么？<br /><em>问我就好。</em></h2>
          <p>集市怎么逛、摊位怎么申请，或是商品和订单操作，都可以从这里开始。</p>
          <div class="suggestion-list" aria-label="常见问题">
            <button v-for="suggestion in suggestions" :key="suggestion" type="button" @click="ask(suggestion)">
              <span>{{ suggestion }}</span><span aria-hidden="true">↗</span>
            </button>
          </div>
        </div>
        <div v-for="message in messages" :key="message.id" class="message" :class="message.role">
          <div v-if="message.role === 'assistant'" class="message-avatar" aria-hidden="true">✦</div>
          <div class="message-content">
            <div class="bubble">{{ message.text }}</div>
            <small v-if="message.source === 'knowledge'">基础知识库</small>
            <small v-else-if="message.source === 'catalog'">实时商品信息</small>
            <small v-else-if="message.source === 'unknown'">暂未找到对应知识</small>
          </div>
        </div>
        <div v-if="busy" class="message assistant">
          <div class="message-avatar" aria-hidden="true">✦</div>
          <div class="bubble thinking" aria-label="正在思考"><span></span><span></span><span></span></div>
        </div>
      </div>

      <div class="ai-footer">
        <p v-if="providerStatus === 'unavailable'" class="ai-state">第三方 AI 暂不可用，已切换至基础知识库</p>
        <p v-else-if="providerStatus === 'not_configured'" class="ai-state">当前使用基础知识库模式</p>
        <form class="ai-compose" @submit.prevent="ask(draft)">
          <input v-model="draft" maxlength="500" :disabled="busy" placeholder="输入问题，例如：如何申请摊位？" aria-label="向客服提问" />
          <button type="submit" :disabled="busy || !draft.trim()" aria-label="发送消息">➜</button>
        </form>
        <p class="ai-note">请勿发送密码或验证码 · 回答仅供参考</p>
      </div>
    </section>

    <button class="ai-launcher" type="button" :aria-expanded="opened" :aria-label="opened ? '关闭智能客服' : '打开智能客服'" @click="toggle">
      <span class="launcher-icon" aria-hidden="true">{{ opened ? '×' : '✦' }}</span><span class="launcher-label">{{ opened ? '收起助手' : '智能客服' }}</span>
    </button>
  </div>
</template>

<script setup>
import { nextTick, ref } from 'vue'
import { sendAiMessage } from '@/api/ai'

const opened = ref(false)
const busy = ref(false)
const draft = ref('')
const sessionId = ref(null)
const providerStatus = ref(null)
const messages = ref([])
const suggestions = ref(['有哪些商品？', '如何申请摊位？', '如何预订商品？', '如何查看订单？'])
const scrollBox = ref(null)
let nextId = 0
function toggle() {
  opened.value = !opened.value
}

function resetChat() {
  sessionId.value = null
  providerStatus.value = null
  messages.value = []
  draft.value = ''
  nextTick(() => { if (scrollBox.value) scrollBox.value.scrollTop = 0 })
}

async function scrollToBottom() {
  await nextTick()
  if (scrollBox.value) scrollBox.value.scrollTop = scrollBox.value.scrollHeight
}

async function ask(value) {
  const question = value?.trim()
  if (!question || busy.value) return
  draft.value = ''
  messages.value.push({ id: ++nextId, role: 'user', text: question })
  busy.value = true
  await scrollToBottom()
  try {
    const response = await sendAiMessage(question, sessionId.value)
    sessionId.value = response.data.sessionId
    providerStatus.value = response.data.providerStatus
    messages.value.push({ id: ++nextId, role: 'assistant', text: response.data.answer, source: response.data.source })
  } catch {
    messages.value.push({ id: ++nextId, role: 'assistant', text: '暂时无法连接客服服务，请稍后再试。' })
  } finally {
    busy.value = false
    await scrollToBottom()
  }
}
</script>

<style scoped>
.ai-service { position: fixed; right: 24px; bottom: 24px; z-index: 3000; font-family: var(--font-sans); }
.ai-panel { display: flex; flex-direction: column; width: min(420px, calc(100vw - 32px)); height: min(640px, calc(100dvh - 112px)); min-height: 360px; margin-bottom: 14px; overflow: hidden; border: 1px solid #d8e7e4; border-radius: 24px; background: #fff; box-shadow: 0 26px 80px rgba(17,62,65,.2), 0 3px 12px rgba(17,62,65,.08); }
.ai-header { position: relative; display: flex; align-items: center; gap: 12px; padding: 19px 20px; color: #fff; background: linear-gradient(124deg, #124f50 0%, var(--brand-primary) 70%, #288983 100%); }
.ai-header::after { content: ''; position: absolute; right: 42px; top: -58px; width: 150px; height: 150px; border: 1px solid rgba(255,255,255,.16); border-radius: 50%; pointer-events: none; }
.ai-avatar { display: grid; place-items: center; flex: 0 0 46px; height: 46px; border: 1px solid rgba(255,255,255,.28); border-radius: 16px; background: rgba(255,255,255,.13); font-size: 24px; }
.ai-heading { display: flex; flex: 1; flex-direction: column; gap: 2px; min-width: 0; }
.ai-overline { color: #b9e8db; font-size: 9px; font-weight: 750; letter-spacing: .16em; }
.ai-heading strong { font-size: 17px; letter-spacing: .02em; }
.ai-availability { display: flex; align-items: center; gap: 5px; color: #d8efeb; font-size: 11px; }
.ai-availability i { width: 6px; height: 6px; border-radius: 50%; background: #99ebbe; box-shadow: 0 0 0 3px rgba(153,235,190,.18); }
.icon-button { z-index: 1; width: 29px; height: 29px; padding: 0; border: 0; border-radius: 9px; background: transparent; color: #fff; font-size: 22px; line-height: 1; cursor: pointer; }
.icon-button:hover { background: rgba(255,255,255,.16); }
.ai-messages { flex: 1; min-height: 0; padding: 20px 18px; overflow-y: auto; background: radial-gradient(circle at top right, #eaf6f2 0, transparent 42%), #f7faf9; }
.ai-welcome { padding: 12px 4px 2px; }
.welcome-icon { display: grid; place-items: center; width: 52px; height: 52px; margin-bottom: 22px; border-radius: 18px; background: #e3f1ec; color: var(--brand-primary); font-size: 25px; }
.welcome-kicker { color: var(--brand-primary); font-size: 11px; font-weight: 750; letter-spacing: .08em; }
.ai-welcome h2 { margin: 9px 0 12px; color: var(--ink-strong); font-size: clamp(27px, 7vw, 34px); line-height: 1.2; letter-spacing: -.04em; }
.ai-welcome h2 em { color: var(--brand-primary); font-style: normal; }
.ai-welcome p { max-width: 310px; margin: 0 0 24px; color: var(--ink); font-size: 13px; line-height: 1.7; }
.suggestion-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 9px; }
.suggestion-list button { display: flex; justify-content: space-between; align-items: center; gap: 6px; min-height: 62px; padding: 11px 12px; border: 1px solid #dce9e6; border-radius: 13px; background: rgba(255,255,255,.9); color: var(--ink-strong); font: 600 12px/1.4 var(--font-sans); text-align: left; cursor: pointer; transition: border-color .18s ease, transform .18s ease, box-shadow .18s ease; }
.suggestion-list button span:last-child { color: var(--brand-primary); font-size: 16px; }
.suggestion-list button:hover { border-color: #91c5b9; box-shadow: var(--shadow-sm); transform: translateY(-2px); }
.message { display: flex; align-items: flex-start; gap: 8px; margin-bottom: 17px; }
.message.user { justify-content: flex-end; }
.message-avatar { display: grid; place-items: center; flex: 0 0 27px; height: 27px; border-radius: 9px; background: #deefea; color: var(--brand-primary); font-size: 15px; }
.message-content { display: flex; flex-direction: column; align-items: flex-start; max-width: calc(100% - 35px); }
.user .message-content { align-items: flex-end; }
.bubble { max-width: 100%; padding: 11px 14px; border: 1px solid #deebe8; border-radius: 4px 15px 15px 15px; background: #fff; color: var(--ink-strong); box-shadow: 0 2px 8px rgba(24,49,59,.035); font-size: 13px; line-height: 1.65; white-space: pre-wrap; overflow-wrap: anywhere; }
.user .bubble { border-color: var(--brand-primary); border-radius: 15px 4px 15px 15px; background: var(--brand-primary); color: #fff; }
.message small { margin: 5px 3px 0; color: var(--ink-muted); font-size: 10px; }
.thinking { display: flex; align-items: center; gap: 4px; min-height: 42px; }
.thinking span { width: 5px; height: 5px; border-radius: 50%; background: var(--brand-primary); animation: pulse 1s ease-in-out infinite; }
.thinking span:nth-child(2) { animation-delay: .15s; }
.thinking span:nth-child(3) { animation-delay: .3s; }
.ai-footer { padding: 11px 14px 9px; border-top: 1px solid #e5eeec; background: #fff; }
.ai-compose { display: flex; align-items: center; gap: 8px; padding: 5px 5px 5px 14px; border: 1px solid #d7e5e2; border-radius: 15px; background: #f8fbfa; transition: border-color .18s ease, box-shadow .18s ease; }
.ai-compose:focus-within { border-color: var(--brand-primary); box-shadow: var(--focus-ring); }
.ai-compose input { flex: 1; min-width: 0; height: 35px; padding: 0; border: 0; outline: 0; background: transparent; color: var(--ink-strong); font: 12px var(--font-sans); }
.ai-compose input::placeholder { color: var(--ink-muted); }
.ai-compose button { display: grid; place-items: center; flex: 0 0 36px; height: 36px; padding: 0; border: 0; border-radius: 11px; background: var(--brand-primary); color: #fff; font-size: 19px; cursor: pointer; }
.ai-compose button:hover:not(:disabled) { background: var(--brand-primary-hover); }
.ai-compose button:disabled { opacity: .45; cursor: not-allowed; }
.ai-note { margin: 8px 0 0; color: var(--ink-muted); font-size: 10px; text-align: center; }
.ai-state { margin: 0 0 8px; color: #946a25; font-size: 11px; text-align: center; }
.ai-launcher { display: flex; align-items: center; gap: 10px; margin-left: auto; padding: 8px 17px 8px 8px; border: 1px solid rgba(255,255,255,.2); border-radius: 999px; background: var(--brand-primary); color: #fff; box-shadow: 0 12px 30px rgba(23,107,104,.3); font: 700 13px var(--font-sans); cursor: pointer; transition: transform .18s ease, box-shadow .18s ease; }
.ai-launcher:hover { transform: translateY(-3px); box-shadow: 0 16px 34px rgba(23,107,104,.35); }
.launcher-icon { display: grid; place-items: center; width: 32px; height: 32px; border-radius: 50%; background: rgba(255,255,255,.18); font-size: 20px; }
@keyframes pulse { 0%, 60%, 100% { opacity: .35; transform: translateY(0); } 30% { opacity: 1; transform: translateY(-3px); } }
@media (max-width: 767px) { .ai-service { right: 14px; bottom: calc(78px + env(safe-area-inset-bottom, 0px)); } .ai-panel { width: calc(100vw - 28px); height: min(610px, calc(100dvh - 170px - env(safe-area-inset-bottom, 0px))); min-height: 280px; border-radius: 20px; } .ai-messages { padding: 17px 14px; } }
@media (max-height: 520px) { .ai-panel { height: calc(100dvh - 96px); min-height: 0; } .ai-service { bottom: 12px; } }
@media (prefers-reduced-motion: reduce) { .thinking span, .ai-launcher, .suggestion-list button { animation: none; transition: none; } }
</style>
