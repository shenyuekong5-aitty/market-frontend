const notificationStyles = {
  '预定请求': { icon: 'Promotion', background: 'var(--brand-primary-soft)', color: 'var(--brand-primary)' },
  '预定结果': { icon: 'Warning', background: '#fff3d8', color: 'var(--warning)' },
  '申请结果': { icon: 'Check', background: '#e8f5ef', color: 'var(--success)' },
  '系统通知': { icon: 'InfoFilled', background: 'var(--surface-subtle)', color: 'var(--ink)' },
}

export function getNotificationStyle(type) {
  return notificationStyles[type] || {
    icon: 'InfoFilled',
    background: 'var(--surface-subtle)',
    color: 'var(--ink-muted)',
  }
}

export function formatNotificationTime(time) {
  return time ? String(time).replace('T', ' ').slice(0, 16) : ''
}
