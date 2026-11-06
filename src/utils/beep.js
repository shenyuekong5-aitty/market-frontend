/**
 * 播放短促提示音（使用 Web Audio API，无需音频文件）
 */
export function playBeep() {
  try {
    // 创建音频上下文（兼容旧版浏览器）
    // 优先使用标准的 AudioContext，不支持则回退到 webkitAudioContext
    const ctx = new (window.AudioContext || window.webkitAudioContext)()

    // 创建振荡器（声音源，可以产生周期性的波形）
    const oscillator = ctx.createOscillator()

    // 创建增益节点（用来控制音量大小）
    const gainNode = ctx.createGain()

    // 设置波形为正弦波，声音柔和
    oscillator.type = 'sine'

    // 设置频率为 880Hz（国际标准音 A5，清亮的高音）
    // setValueAtTime(值, 时间) 表示从指定时间点开始使用该值
    oscillator.frequency.setValueAtTime(880, ctx.currentTime)

    // 设置初始音量为 0.3（范围 0～1，0.3 适中不刺耳）
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime)

    // 让音量在 0.3 秒内指数级衰减到 0.01（接近静音）
    // 指数衰减听起来更自然，类似声音自然消散
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)

    // 连接节点：振荡器 -> 增益节点 -> 音频输出（扬声器）
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    // 从当前时间开始发声
    oscillator.start(ctx.currentTime)

    // 0.3 秒后停止发声
    oscillator.stop(ctx.currentTime + 0.3)
  } catch (e) {
    // 静默失败，不阻塞主流程
    // 提示音只是辅助功能，出错不影响业务逻辑
  }
}