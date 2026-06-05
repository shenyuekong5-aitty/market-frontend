<template>
  <el-drawer v-model="visible" title="账号安全中心" size="380px">
    <div class="check-main">
      <!-- 评分圆环 -->
      <div
        class="score-circle"
        :class="{ 'is-scanning': scanning }"
        :style="{
          borderColor: scanning ? '#409eff' : realScore >= 90 ? '#67c23a' : realScore >= 70 ? '#e6a23c' : '#f56c6c',
          boxShadow: scanning ? '0 0 18px rgba(64, 158, 255, 0.25)' : '0 6px 24px rgba(0, 0, 0, 0.08)'
        }"
      >
        <!-- 分数数字：扫描中深灰，结束后动态变色 -->
        <span class="num" :style="{ color: scanning ? '#303133' : scoreColor }">
          {{ scanning ? randomScore : realScore }}
        </span>
        <span class="unit">分</span>
      </div>

      <p class="tip-text">
        {{ scanning ? '系统正在全面扫描安全漏洞...' : overallMessage }}
      </p>

      <div class="check-content">
        <div v-for="item in checkItems" :key="item.id" class="item-row">
          <div class="left">
            <el-icon :class="['status-icon', scanning ? 'is-loading' : item.status]">
              <component :is="scanning ? 'Loading' : item.status === 'success' ? 'CircleCheck' : 'Warning'" />
            </el-icon>
            <span class="label">{{ item.label }}</span>
          </div>
          <div class="right-result" :style="{ color: scanning ? '#409eff' : '#606266' }">
            {{ scanning ? '检测中...' : item.result }}
          </div>
        </div>
      </div>

      <div class="footer">
        <el-button type="primary" plain :loading="scanning" @click="startCheck">
          {{ scanning ? '正在扫描' : '重新扫描' }}
        </el-button>
      </div>
    </div>
  </el-drawer>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { getSecurityCheck } from '@/api/account'
import { ElMessage } from 'element-plus'

const visible = ref(false)
const scanning = ref(false)
const randomScore = ref(0)
const checkItems = ref([])
const overallMessage = ref('')
const realScore = ref(100)

// 动态分数颜色（绿 / 橙 / 红）
const scoreColor = computed(() => {
  const s = realScore.value ?? 100
  if (s >= 90) return '#67c23a'
  if (s >= 70) return '#e6a23c'
  return '#f56c6c'
})

let timer = null

const fetchData = async () => {
  try {
    const res = await getSecurityCheck()
    const data = res.data
    overallMessage.value = data.message
    checkItems.value = data.items
    realScore.value = data.score ?? 100  // 防止空值
  } catch (error) {
    ElMessage.error('获取安全检测失败')
    throw error
  }
}

const startCheck = async () => {
  if (scanning.value) return
  scanning.value = true

  timer = setInterval(() => {
    randomScore.value = Math.floor(Math.random() * 60) + 40
  }, 50)

  const startTime = Date.now()
  try {
    await fetchData()
    const costTime = Date.now() - startTime
    if (costTime < 1200) {
      await new Promise(resolve => setTimeout(resolve, 1200 - costTime))
    }
  } catch (e) {
    // 错误已提示
  } finally {
    clearInterval(timer)
    scanning.value = false
  }
}

const open = () => {
  visible.value = true
  startCheck()
}

onUnmounted(() => {
  clearInterval(timer)
})

defineExpose({ open })
</script>

<style scoped>
.check-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 28px 16px;
  background: #f5f7fa;
  min-height: 100%;
  box-sizing: border-box;
}

.score-circle {
  width: 140px;
  height: 140px;
  border: 6px solid #e4e7ed;
  border-radius: 50%;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-bottom: 22px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.06);
  transition: border-color 0.4s, box-shadow 0.4s;
}

.is-scanning {
  animation: breath 1.4s infinite ease-in-out;
}

.num {
  font-size: 52px;
  font-weight: 800;
  font-family: 'Courier New', Courier, monospace;
  line-height: 1;
  margin-bottom: 2px;
  /* 颜色已改为内联绑定，这里无需定义 */
}

.unit {
  font-size: 14px;
  font-weight: 500;
  color: #909399;
  letter-spacing: 1px;
}

.tip-text {
  font-size: 14px;
  color: #606266;
  margin: 0 0 24px 0;
  padding: 6px 18px;
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
}

.check-content {
  width: 100%;
  max-width: 320px;
}

.item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 0;
  border-bottom: 1px dashed #dcdfe6;
  transition: background-color 0.25s;
}

.item-row:last-child {
  border-bottom: none;
}

.item-row:hover {
  background-color: #f0f2f5;
}

.left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-icon {
  font-size: 18px;
}
.status-icon.success {
  color: #67c23a;
}
.status-icon.warning {
  color: #e6a23c;
}
.status-icon.is-loading {
  animation: rotating 2s linear infinite;
  color: #409eff;
}

.label {
  font-size: 15px;
  color: #303133;
}

.right-result {
  font-size: 13px;
  color: #606266;
  text-align: right;
  max-width: 130px;
  word-break: break-word;
}

.footer {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 28px;
}

.footer .el-button {
  min-width: 140px;
  border-radius: 20px;
  font-weight: 500;
}

@keyframes breath {
  0% { transform: scale(0.96); }
  50% { transform: scale(1.04); }
  100% { transform: scale(0.96); }
}

@keyframes rotating {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>