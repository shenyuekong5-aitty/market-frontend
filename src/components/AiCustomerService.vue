<template>
  <div class="ai-service">
    <section v-if="opened" class="ai-panel" aria-label="智慧集市客服">
      <header class="ai-header">
        <div class="ai-avatar" aria-hidden="true">✦</div>
        <div class="ai-heading">
          <strong>集市小助手</strong>
          <span>智能问答 · 常见问题随时可问</span>
        </div>
        <button class="icon-button" type="button" title="开启新对话" aria-label="开启新对话" @click="resetChat">↺</button>
        <button class="icon-button" type="button" title="关闭客服" aria-label="关闭客服" @click="opened = false">×</button>
      </header>

      <div ref="scrollBox" class="ai-messages" aria-live="polite">
        <div class="message assistant">
          <div class="bubble">你好！我是集市小助手。可以问我集市浏览、摊位申请、商品、预订和订单操作。涉及个人状态时，请以系统页面为准。</div>
        </div>
        <div v-for="message in messages" :key="message.id" class="message" :class="message.role">
          <div class="bubble">{{ message.text }}</div>
          <small v-if="message.source === 'knowledge'">基础知识库回答</small>
          <small v-else-if="message.source === 'catalog'">实时在售商品</small>
          <small v-else-if="message.source === 'unknown'">暂未找到对应知识</small>
        </div>
        <div v-if="busy" class="message assistant"><div class="bubble thinking">正在思考…</div></div>
      </div>

      <div v-if="!messages.length" class="ai-suggestions">
        <button v-for="suggestion in suggestions" :key="suggestion" type="button" @click="ask(suggestion)">{{ suggestion }}</button>
      </div>

      <form class="ai-compose" @submit.prevent="ask(draft)">
        <input v-model="draft" maxlength="500" :disabled="busy" placeholder="输入你的问题…" aria-label="向客服提问" />
        <button type="submit" :disabled="busy || !draft.trim()" aria-label="发送消息">发送</button>
      </form>
      <p v-if="providerStatus === 'unavailable'" class="ai-state">第三方 AI 暂不可用，已切换至基础知识库</p>
      <p v-else-if="providerStatus === 'not_configured'" class="ai-state">当前使用基础知识库模式</p>
      <p class="ai-note">请勿发送密码、验证码等敏感信息。AI 回答仅供参考。</p>
    </section>

    <button class="ai-launcher" type="button" :aria-expanded="opened" aria-label="打开智能客服" @click="toggle">
      <span aria-hidden="true">✦</span><span class="launcher-label">智能客服</span>
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
.ai-service { position: fixed; right: 22px; bottom: 24px; z-index: 3000; font-family: var(--font-sans); }
.ai-launcher { display: flex; align-items: center; gap: 9px; padding: 12px 17px; border: 0; border-radius: 999px; background: var(--brand-primary); color: #fff; box-shadow: 0 10px 30px rgba(23,107,104,.28); font-weight: 700; cursor: pointer; }
.ai-launcher:hover { background: var(--brand-primary-hover); transform: translateY(-2px); }
.ai-launcher span:first-child { font-size: 21px; line-height: 1; }
.ai-panel { display: flex; flex-direction: column; width: min(390px, calc(100vw - 28px)); height: min(570px, calc(100dvh - 125px)); margin-bottom: 12px; overflow: hidden; border: 1px solid var(--line); border-radius: var(--radius-lg); background: var(--surface-card); box-shadow: 0 20px 60px rgba(24,49,59,.2); }
.ai-header { display: flex; align-items: center; gap: 10px; padding: 15px; background: var(--brand-primary); color: #fff; }
.ai-avatar { display: grid; place-items: center; flex: 0 0 36px; height: 36px; border-radius: 12px; background: rgba(255,255,255,.18); font-size: 22px; }
.ai-heading { display: flex; flex: 1; flex-direction: column; gap: 2px; min-width: 0; }
.ai-heading strong { font-size: 15px; }
.ai-heading span { font-size: 11px; opacity: .82; }
.icon-button { border: 0; background: transparent; color: #fff; font-size: 22px; line-height: 1; cursor: pointer; }
.ai-messages { flex: 1; min-height: 0; padding: 17px 15px; overflow-y: auto; background: #f8fbfb; }
.message { display: flex; flex-direction: column; align-items: flex-start; gap: 4px; margin-bottom: 13px; }
.message.user { align-items: flex-end; }
.bubble { max-width: 89%; padding: 11px 13px; border: 1px solid var(--line); border-radius: 16px 16px 16px 4px; background: #fff; color: var(--ink-strong); font-size: 13px; line-height: 1.55; white-space: pre-wrap; overflow-wrap: anywhere; }
.user .bubble { border-color: var(--brand-primary); border-radius: 16px 16px 4px 16px; background: var(--brand-primary); color: #fff; }
.message small { color: var(--ink-muted); font-size: 10px; }
.thinking { color: var(--ink-muted); }
.ai-suggestions { display: flex; gap: 7px; padding: 10px 15px; overflow-x: auto; border-top: 1px solid var(--line); }
.ai-suggestions button { flex: 0 0 auto; padding: 6px 10px; border: 1px solid var(--line); border-radius: 999px; background: var(--brand-primary-soft); color: var(--brand-primary); font-size: 11px; cursor: pointer; }
.ai-compose { display: flex; gap: 8px; padding: 10px 12px 4px; }
.ai-compose input { flex: 1; min-width: 0; height: 38px; padding: 0 12px; border: 1px solid var(--line); border-radius: var(--radius-sm); background: var(--surface-page); outline: none; color: var(--ink-strong); }
.ai-compose input:focus { border-color: var(--brand-primary); box-shadow: var(--focus-ring); }
.ai-compose button { padding: 0 15px; border: 0; border-radius: var(--radius-sm); background: var(--brand-primary); color: #fff; font-weight: 600; cursor: pointer; }
.ai-compose button:disabled { opacity: .45; cursor: not-allowed; }
.ai-note { margin: 0; padding: 3px 12px 10px; color: var(--ink-muted); font-size: 10px; text-align: center; }
.ai-state { margin: 3px 12px 0; color: var(--warning); font-size: 11px; text-align: center; }
@media (max-width: 768px) {
  .ai-service { right: 14px; bottom: calc(78px + env(safe-area-inset-bottom, 0px)); }
  .ai-panel { height: min(520px, calc(100dvh - 180px)); }
  .ai-launcher { padding: 11px 14px; }
}
@media (max-width: 420px) {
  .ai-panel { width: calc(100vw - 28px); }
}
</style>
