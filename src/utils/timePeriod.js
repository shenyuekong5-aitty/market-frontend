export function getGreetingPeriod() {
  const hour = new Date().getHours()
  if (hour < 6) return '凌晨'
  if (hour < 9) return '早上'
  if (hour < 12) return '上午'
  if (hour < 14) return '中午'
  if (hour < 18) return '下午'
  if (hour < 20) return '傍晚'
  return '晚上'
}