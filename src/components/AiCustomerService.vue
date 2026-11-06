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
          <div><span class="welcome-kicker">智慧集市服务助手</span>
          <h2>你好，需要帮忙吗？</h2>
          <p>我可以解答逛集市、申请摊位、商品预订与订单操作等问题。</p></div>
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
            <small v-if="message.source === 'ai'">第三方 AI</small>
            <small v-else-if="message.source === 'knowledge'">基础知识库</small>
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
import { getAiSuggestions, sendAiMessage } from '@/api/ai'

const opened = ref(false)
const busy = ref(false)
const draft = ref('')
const sessionId = ref(null)
const providerStatus = ref(null)
const messages = ref([])
const suggestions = ref(['有哪些商品？', '如何申请摊位？', '如何预订商品？', '如何查看订单？'])
let suggestionsLoaded = false
const scrollBox = ref(null)
let nextId = 0
function toggle() {
  opened.value = !opened.value
  if (opened.value && !suggestionsLoaded) loadSuggestions()
}

async function loadSuggestions() {
  suggestionsLoaded = true
  try {
    const response = await getAiSuggestions()
    if (Array.isArray(response.data) && response.data.length) suggestions.value = response.data
  } catch {
    suggestionsLoaded = false
  }
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
.ai-service { position: fixed; right: 22px; bottom: 22px; z-index: 1300; font-family: var(--font-sans); }
.ai-panel { display: flex; flex-direction: column; width: min(390px, calc(100vw - 28px)); height: min(560px, calc(100dvh - 105px)); min-height: 350px; margin-bottom: 12px; overflow: hidden; border: 1px solid #d7e5e1; border-radius: 18px; background: #fff; box-shadow: 0 22px 60px rgba(18, 62, 58, .18); }
.ai-header { display: flex; align-items: center; gap: 10px; min-height: 70px; padding: 12px 14px; border-bottom: 1px solid #deebe7; color: var(--ink-strong); background: rgba(250, 252, 249, .98); }
.ai-avatar { display: grid; place-items: center; flex: 0 0 40px; height: 40px; border-radius: 12px; background: var(--brand-primary); color: #fff; font-size: 20px; }
.ai-heading { display: flex; flex: 1; flex-direction: column; gap: 1px; min-width: 0; }
.ai-overline { color: var(--brand-primary); font-size: 8px; font-weight: 700; letter-spacing: .14em; }
.ai-heading strong { font-size: 15px; letter-spacing: .01em; }
.ai-availability { display: flex; align-items: center; gap: 5px; color: var(--ink-muted); font-size: 10px; }
.ai-availability i { width: 6px; height: 6px; border-radius: 50%; background: #52ad7b; }
.icon-button { display: grid; place-items: center; width: 32px; height: 32px; padding: 0; border: 0; border-radius: 9px; background: transparent; color: var(--ink); font-size: 20px; line-height: 1; cursor: pointer; }
.icon-button:hover { background: var(--brand-primary-soft); color: var(--brand-primary); }
.ai-messages { flex: 1; min-height: 0; padding: 18px 16px; overflow-y: auto; background: #f7faf7; scrollbar-width: thin; scrollbar-color: #bad0ca transparent; }
.ai-welcome { display: grid; grid-template-columns: 42px 1fr; gap: 12px; align-items: start; }
.welcome-icon { display: grid; place-items: center; width: 42px; height: 42px; border-radius: 12px; background: #dfefea; color: var(--brand-primary); font-size: 19px; }
.welcome-kicker { color: var(--brand-primary); font-size: 10px; font-weight: 600; letter-spacing: .04em; }
.ai-welcome h2 { margin: 4px 0 5px; color: var(--ink-strong); font-size: 20px; line-height: 1.35; letter-spacing: -.02em; }
.ai-welcome p { margin: 0; color: var(--ink); font-size: 12px; line-height: 1.7; }
.suggestion-list { grid-column: 1 / -1; display: grid; gap: 8px; margin-top: 8px; }
.suggestion-list button { display: flex; justify-content: space-between; align-items: center; gap: 8px; min-height: 44px; padding: 10px 13px; border: 1px solid #dce8e4; border-radius: 11px; background: #fff; color: var(--ink-strong); font: 500 12px/1.4 var(--font-sans); text-align: left; cursor: pointer; transition: border-color .15s, background .15s; }
.suggestion-list button span:last-child { color: var(--brand-primary); font-size: 15px; }
.suggestion-list button:hover { border-color: #8ab9ad; background: #f4faf7; }
.message { display: flex; align-items: flex-start; gap: 8px; margin-bottom: 14px; }
.message.user { justify-content: flex-end; }
.message-avatar { display: grid; place-items: center; flex: 0 0 27px; height: 27px; border-radius: 8px; background: #deefea; color: var(--brand-primary); font-size: 14px; }
.message-content { display: flex; flex-direction: column; align-items: flex-start; max-width: calc(100% - 36px); }
.user .message-content { align-items: flex-end; }
.bubble { max-width: 100%; padding: 10px 13px; border: 1px solid #dce9e5; border-radius: 5px 14px 14px 14px; background: #fff; color: var(--ink-strong); font-size: 12px; line-height: 1.65; white-space: pre-wrap; overflow-wrap: anywhere; }
.user .bubble { border-color: var(--brand-primary); border-radius: 14px 5px 14px 14px; background: var(--brand-primary); color: #fff; }
.message small { margin: 4px 3px 0; color: var(--ink-muted); font-size: 9px; }
.thinking { display: flex; align-items: center; gap: 4px; min-height: 38px; }
.thinking span { width: 5px; height: 5px; border-radius: 50%; background: var(--brand-primary); animation: pulse 1s ease-in-out infinite; }
.thinking span:nth-child(2) { animation-delay: .15s; }
.thinking span:nth-child(3) { animation-delay: .3s; }
.ai-footer { padding: 10px 12px 8px; border-top: 1px solid #e2ece9; background: #fff; }
.ai-compose { display: flex; align-items: center; gap: 7px; padding: 4px 4px 4px 12px; border: 1px solid #d5e3df; border-radius: 13px; background: #f8faf9; }
.ai-compose:focus-within { border-color: var(--brand-primary); box-shadow: var(--focus-ring); }
.ai-compose input { flex: 1; min-width: 0; height: 34px; padding: 0; border: 0; outline: 0; background: transparent; color: var(--ink-strong); font: 12px var(--font-sans); }
.ai-compose input::placeholder { color: var(--ink-muted); }
.ai-compose button { display: grid; place-items: center; flex: 0 0 34px; height: 34px; padding: 0; border: 0; border-radius: 10px; background: var(--brand-primary); color: #fff; font-size: 17px; cursor: pointer; }
.ai-compose button:disabled { opacity: .4; cursor: not-allowed; }
.ai-note { margin: 6px 0 0; color: var(--ink-muted); font-size: 9px; text-align: center; }
.ai-state { margin: 0 0 6px; color: #8a642b; font-size: 10px; text-align: center; }
.ai-launcher { display: flex; align-items: center; gap: 8px; margin-left: auto; padding: 7px 15px 7px 7px; border: 1px solid rgba(255,255,255,.3); border-radius: 999px; background: var(--brand-primary); color: #fff; box-shadow: 0 10px 26px rgba(23,107,104,.26); font: 600 12px var(--font-sans); cursor: pointer; }
.launcher-icon { display: grid; place-items: center; width: 30px; height: 30px; border-radius: 50%; background: rgba(255,255,255,.18); font-size: 17px; }
@keyframes pulse { 0%, 60%, 100% { opacity: .35; transform: translateY(0); } 30% { opacity: 1; transform: translateY(-3px); } }
@media (max-width: 767px) {
  .ai-service { right: 12px; bottom: calc(70px + env(safe-area-inset-bottom, 0px)); }
  .ai-panel { width: calc(100vw - 24px); height: min(68dvh, 560px); margin-bottom: 10px; border-radius: 18px; }
  .ai-launcher { width: 44px; height: 44px; padding: 0; justify-content: center; }
  .launcher-label { display: none; }
  .launcher-icon { width: 30px; height: 30px; }
}
@media (max-height: 560px) { .ai-panel { height: calc(100dvh - 78px); min-height: 0; } .ai-service { bottom: 10px; } }
@media (prefers-reduced-motion: reduce) { .thinking span, .suggestion-list button { animation: none; transition: none; } }
</style>
