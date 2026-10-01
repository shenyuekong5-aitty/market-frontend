<template>
  <UiDrawer v-model="visible" title="账号安全中心" size="380px">
    <div class="check-main">
      <!-- 评分圆环 -->
      <div
        class="score-circle"
        :class="{ 'is-scanning': scanning }"
        :style="{
          borderColor: scanning
            ? 'var(--brand-primary)'
            : realScore >= 90
              ? 'var(--success)'
              : realScore >= 70
                ? 'var(--warning)'
                : 'var(--danger)',
          boxShadow: scanning
            ? 'var(--focus-ring)'
            : 'var(--shadow-md)',
        }"
      >
        <!-- 分数数字：扫描中深灰，结束后动态变色 -->
        <span class="num" :style="{ color: scanning ? 'var(--ink-strong)' : scoreColor }">
          {{ scanning ? randomScore : realScore }}
        </span>
        <span class="unit">分</span>
      </div>

      <!-- 提示文本 -->
      <p class="tip-text">
        {{ scanning ? "系统正在全面扫描安全漏洞..." : overallMessage }}
        <span
          v-if="errorOccurred && !scanning"
          class="warning-note"
          >（上次检测结果）</span
        >
      </p>

      <!-- 扫描过程 -->
      <div class="check-content">
        <div v-for="item in checkItems" :key="item.id" class="item-row" :title="item.id === 'info' ? '检测项包含：头像、昵称、手机号' : ''">
          <div class="left">
            <el-icon
              :class="['status-icon', scanning ? 'is-loading' : item.status]"
            >
              <component
                :is="
                  scanning
                    ? 'Loading'
                    : item.status === 'success'
                      ? 'CircleCheck'
                      : 'Warning'
                "
              />
            </el-icon>
            <span class="label">{{ item.label }}</span>
          </div>
          <div
            class="right-result"
            :style="{ color: scanning ? 'var(--brand-primary)' : 'var(--ink)' }"
          >
            {{ scanning ? "检测中..." : item.result }}
          </div>
        </div>
      </div>

      <!-- 底部文本 -->
      <div class="footer">
        <UiButton type="primary" class="rescan-button" :loading="scanning" @click="startCheck">
          {{ scanning ? "正在扫描" : "重新扫描" }}
        </UiButton>
      </div>
    </div>
  </UiDrawer>
</template>

<script setup>
import { ref, computed, onUnmounted } from "vue";
import { getSecurityCheck } from "@/api/account";
import { ElMessage } from "element-plus";

const visible = ref(false); // 弹窗显隐
const scanning = ref(false); // 是否正在扫描
const randomScore = ref(0); // 扫描中的随机动画分数
const checkItems = ref([]); // 安全检测项列表
const overallMessage = ref(""); // 总体评价信息
const realScore = ref(100); // 接口返回的真实安全评分
const errorOccurred = ref(false); // 网络异常标记，控制错误提示显示

// 根据真实分数动态映射颜色：绿(>=90) / 橙(>=70) / 红(<70)
const scoreColor = computed(() => {
  const s = realScore.value ?? 100;
  if (s >= 90) return "var(--success)";
  if (s >= 70) return "var(--warning)";
  return "var(--danger)";
});

let timer = null; // 分数动画定时器

// 请求后端安全检测数据，若失败且无旧数据则设默认文案
const fetchData = async () => {
  try {
    const res = await getSecurityCheck();
    const data = res.data;
    overallMessage.value = data.message;
    checkItems.value = data.items;
    realScore.value = data.score ?? 100;
    errorOccurred.value = false;
  } catch (error) {
    if (checkItems.value.length === 0) {
      overallMessage.value = "网络异常，无法获取安全检测结果";
    }
    errorOccurred.value = true;
    ElMessage.error("获取安全检测失败，请稍后重试");
    throw error;
  }
};

// 启动扫描：40~99 间随机闪烁分数，拉取接口，最短展示 1.2 秒
const startCheck = async () => {
  if (scanning.value) return;
  scanning.value = true;

  timer = setInterval(() => {
    randomScore.value = Math.floor(Math.random() * 60) + 40;
  }, 50);

  const startTime = Date.now();
  try {
    await fetchData();
    const costTime = Date.now() - startTime;
    if (costTime < 1200) {
      await new Promise((resolve) => setTimeout(resolve, 1200 - costTime));
    }
  } catch (e) {
    // 错误已在 fetchData 中提示，此处无需额外处理
  } finally {
    clearInterval(timer);
    scanning.value = false;
  }
};

// 对外暴露：打开弹窗并自动开始安全检测
const open = () => {
  visible.value = true;
  startCheck();
};

// 组件销毁时清除定时器，防止内存泄漏
onUnmounted(() => {
  clearInterval(timer);
});

defineExpose({ open });
</script>

<style scoped>
.check-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 28px 16px;
  background: var(--surface-page);
  min-height: 100%;
  box-sizing: border-box;
}

.score-circle {
  width: 140px;
  height: 140px;
  border: 6px solid var(--line);
  border-radius: 50%;
  background: var(--surface-card);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-bottom: 22px;
  box-shadow: var(--shadow-md);
  transition:
    border-color 0.4s,
    box-shadow 0.4s;
}

.is-scanning {
  animation: breath 1.4s infinite ease-in-out;
}

.num {
  font-size: 52px;
  font-weight: 800;
  font-family: "Courier New", Courier, monospace;
  line-height: 1;
  margin-bottom: 2px;
  /* 颜色已改为内联绑定，这里无需定义 */
}

.unit {
  font-size: 14px;
  font-weight: 500;
  color: var(--ink-muted);
  letter-spacing: 1px;
}

.tip-text {
  font-size: 14px;
  color: var(--ink);
  margin: 0 0 24px 0;
  padding: 6px 18px;
  background: var(--surface-card);
  border-radius: 20px;
  box-shadow: var(--shadow-sm);
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
  border-bottom: 1px dashed var(--line);
  transition: background-color 0.25s;
}

.item-row:last-child {
  border-bottom: none;
}

.item-row:hover {
  background-color: var(--surface-subtle);
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
  color: var(--success);
}
.status-icon.warning {
  color: var(--warning);
}
.status-icon.is-loading {
  animation: rotating 2s linear infinite;
  color: var(--brand-primary);
}

.label {
  font-size: 15px;
  color: var(--ink-strong);
}

.right-result {
  font-size: 13px;
  color: var(--ink);
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

.warning-note { color: var(--warning); margin-left: 6px; }

.footer :deep(.rescan-button.ui-button) {
  min-width: 140px;
  min-height: 42px;
  border-radius: 999px;
  background: #e5f2ed;
  border-color: #176b68;
  color: #176b68;
  font-weight: 700;
  box-shadow: none;
}
.footer :deep(.rescan-button.ui-button .ui-button__label) { color: #176b68; }
.footer :deep(.rescan-button.ui-button:hover:not(:disabled)) { background: #d5eae2; border-color: #115653; color: #115653; }

@keyframes breath {
  0% {
    transform: scale(0.96);
  }
  50% {
    transform: scale(1.04);
  }
  100% {
    transform: scale(0.96);
  }
}

@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
