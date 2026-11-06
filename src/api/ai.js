import request from '@/utils/request'

export function sendAiMessage(question, sessionId) {
  return request.post('/ai/chat', { question, sessionId }, { timeout: 23000 })
}

export function getAiSuggestions() {
  return request.get('/ai/suggestions', { silentError: true })
}
