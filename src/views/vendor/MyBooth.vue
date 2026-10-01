<template>
  <div class="my-booth-page">
    <!-- 有摊位 -->
    <UiCard v-if="vendorStore.myBooth" class="booth-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">我的摊位</span>
          <span
            class="status-badge"
            :class="vendorStore.myBooth.status === '空闲' ? 'status-free' : 'status-occupied'"
          >
            {{ vendorStore.myBooth.status }}
          </span>
        </div>
      </template>

      <el-form :model="form" label-width="80px" @submit.prevent class="booth-form">
        <UiFormItem label="摊位名称">
        <UiInput v-model="form.title" placeholder="请输入摊位名称" class="form-input" />
        </UiFormItem>
        <UiFormItem label="主营描述">
          <UiInput
            v-model="form.description"
            type="textarea"
            placeholder="请描述你的主营商品或服务"
            class="form-textarea"
            :rows="3"
          />
        </UiFormItem>
        <UiFormItem label="营业时间">
        <UiInput v-model="form.openTime" placeholder="如 08:00-20:00" class="form-input" />
        </UiFormItem>
        <UiFormItem>
          <div class="form-actions">
            <button class="btn-primary" :disabled="saving" @click="save">
              {{ saving ? '保存中...' : '保存修改' }}
            </button>
            <button class="btn-outline" @click="handleChangeBooth">更换摊位</button>
            <button class="btn-danger" @click="handleReturnBooth">归还摊位</button>
          </div>
        </UiFormItem>
      </el-form>
    </UiCard>

    <!-- 空状态 -->
    <UiCard v-else class="empty-card">
      <div class="empty-tip">
        <span class="empty-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>
          </svg>
        </span>
        <p>您还没有已占用的摊位</p>
        <button class="btn-primary" @click="router.push('/vendor/market-select')">
          去选择摊位
        </button>
      </div>
    </UiCard>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useVendorStore } from '@/store/modules/vendor'
import { ElMessage, ElMessageBox } from 'element-plus'


const router = useRouter()
const vendorStore = useVendorStore()

const saving = ref(false)
const form = reactive({ title: '', description: '', openTime: '' })

// 初始化摊位数据
const loadBooth = async () => {
  try {
    await vendorStore.fetchMyBooth()
    if (vendorStore.myBooth) {
      form.title = vendorStore.myBooth.title || ''
      form.description = vendorStore.myBooth.description || ''
      form.openTime = vendorStore.myBooth.openTime || ''
    }
  } catch (e) {
    ElMessage.error('获取摊位信息失败')
  }
}

const save = async () => {
  saving.value = true
  try {
    await vendorStore.saveMyBooth({ ...form })
    ElMessage.success('摊位信息已更新')
  } catch (e) {
    ElMessage.error(e.message || '保存失败')
  } finally {
    saving.value = false
  }
}

const handleChangeBooth = () => {
  ElMessageBox.confirm(
    '更换摊位后，原摊位下的所有商品和购物车记录将被永久删除，新摊位需要重新上架商品。\n\n确定要更换摊位吗？',
    '更换摊位 - 重要提醒',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      router.push('/vendor/market-select?mode=change')
    })
    .catch(() => {})
}

const handleReturnBooth = () => {
  ElMessageBox.confirm(
    '归还摊位后，您的身份将恢复为普通用户（如果无其他摊位）。\n\n⚠️ 此操作将永久删除该摊位下的所有商品和相关购物车记录，且不可恢复。\n\n确定要继续吗？',
    '归还摊位 - 重要提醒',
    {
      confirmButtonText: '确定归还',
      cancelButtonText: '取消',
      type: 'warning',
      dangerouslyUseHTMLString: false,
    }
  )
    .then(async () => {
      try {
        await vendorStore.submitReturnBooth()
        ElMessage.success('归还申请已提交，请等待管理员审批')
        await vendorStore.fetchMyBooth()
      } catch (e) {
        ElMessage.error(e.message || '申请失败')
      }
    })
    .catch(() => {})
}

onMounted(() => {
  loadBooth()
})
</script>

<style scoped>
/* ============================================================
   1. 设计 Token
   ============================================================ */
.my-booth-page {
  --text: var(--ink-strong);
  --text-secondary: var(--ink);
  --text-muted: var(--ink-muted);
  --accent: var(--brand-primary);
  --accent-light: var(--brand-primary-soft);
  --green: var(--success);
  --green-bg: #e8f5ef;
  --red: var(--danger);
  --red-bg: #fdebea;
  --shadow: var(--shadow-sm);
  --radius: var(--radius-md);

  padding: 20px;
  max-width: 720px;
  margin: 0 auto;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif;
  color: var(--text);
}

/* ============================================================
   2. 卡片样式
   ============================================================ */
:deep(.ui-card) {
  border: none !important;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  overflow: hidden;
}

:deep(.ui-card__header) {
  border-bottom: 1px solid var(--line);
  padding: 18px 24px;
  background: var(--surface-card);
}

:deep(.ui-card__body) {
  padding: 24px;
}

/* ============================================================
   3. 卡片头部
   ============================================================ */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text);
}

/* 状态标签 */
.status-badge {
  display: inline-block;
  padding: 2px 14px;
  border-radius: 100px;
  font-size: 0.7rem;
  font-weight: 500;
}

.status-free {
  background-color: var(--line);
  color: var(--text-muted);
}

.status-occupied {
  background-color: var(--green-bg);
  color: var(--green);
}

/* ============================================================
   4. 表单
   ============================================================ */
.booth-form {
  margin-top: 4px;
}

:deep(.booth-form .el-form-item) {
  margin-bottom: 20px;
}

:deep(.booth-form .el-form-item__label) {
  color: var(--text-secondary);
  font-weight: 500;
  font-size: 0.85rem;
  line-height: 1.5;
}

/* 输入框 */
.form-input :deep(.el-input__wrapper) {
  border-radius: 100px;
  box-shadow: none !important;
  border: 1px solid var(--line);
  padding: 0 18px;
  height: 44px;
  transition: border-color 0.25s;
}

.form-input :deep(.el-input__wrapper.is-focus) {
  border-color: var(--accent);
}

.form-input :deep(.el-input__inner) {
  color: var(--text);
  font-size: 0.9rem;
}

.form-input :deep(.el-input__inner::placeholder) {
  color: var(--text-muted);
}

/* 文本域 */
.form-textarea :deep(.el-textarea__inner) {
  border-radius: 16px;
  box-shadow: none !important;
  border: 1px solid var(--line);
  padding: 14px 18px;
  color: var(--text);
  font-size: 0.9rem;
  font-family: inherit;
  transition: border-color 0.25s;
  resize: vertical;
}

.form-textarea :deep(.el-textarea__inner:focus) {
  border-color: var(--accent);
}

.form-textarea :deep(.el-textarea__inner::placeholder) {
  color: var(--text-muted);
}

/* ============================================================
   5. 按钮
   ============================================================ */
.form-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 4px;
}

.btn-primary {
  padding: 10px 28px;
  border-radius: 100px;
  background: var(--text);
  border: none;
  font-weight: 500;
  font-size: 0.9rem;
  color: #fff;
  cursor: pointer;
  transition: background 0.25s, transform 0.2s;
}

.btn-primary:hover:not(:disabled) {
  background: var(--accent);
}

.btn-primary:active:not(:disabled) {
  transform: scale(0.97);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-outline {
  padding: 10px 24px;
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

.btn-danger {
  padding: 10px 24px;
  border-radius: 100px;
  background: transparent;
  border: 1px solid var(--line);
  font-weight: 500;
  font-size: 0.9rem;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.25s;
}

.btn-danger:hover {
  border-color: var(--red);
  color: var(--red);
  background: var(--red-bg);
}

.btn-danger:active {
  transform: scale(0.97);
}

/* ============================================================
   6. 空状态
   ============================================================ */
.empty-card {
  margin-top: 0;
}

.empty-tip {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 40px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 2.4rem;
  opacity: 0.4;
}

.empty-tip p {
  color: var(--text-muted);
  font-size: 0.95rem;
  margin: 0;
}

.empty-tip .btn-primary {
  margin-top: 4px;
}

/* ============================================================
   7. 响应式适配
   ============================================================ */

/* ---- 移动端（< 768px） ---- */
@media (max-width: 767px) {
  .my-booth-page {
    padding: 8px;
  }

  :deep(.ui-card__header) {
    padding: 14px 16px;
  }

  :deep(.ui-card__body) {
    padding: 16px;
  }

  .card-title {
    font-size: 0.95rem;
  }

  .status-badge {
    font-size: 0.6rem;
    padding: 2px 12px;
  }

  :deep(.booth-form .el-form-item) {
    margin-bottom: 16px;
  }

  :deep(.booth-form .el-form-item__label) {
    font-size: 0.8rem;
    padding-bottom: 4px;
  }

  .form-input :deep(.el-input__wrapper) {
    height: 40px;
    padding: 0 14px;
  }

  .form-textarea :deep(.el-textarea__inner) {
    padding: 12px 14px;
    font-size: 0.85rem;
  }

  .form-actions {
    flex-direction: column;
    gap: 8px;
  }

  .form-actions button {
    width: 100%;
    justify-content: center;
    padding: 12px 16px;
    font-size: 0.9rem;
  }

  .empty-tip {
    padding: 32px 16px;
  }

  .empty-icon {
    font-size: 2rem;
  }

  .empty-tip p {
    font-size: 0.85rem;
  }

  .empty-tip .btn-primary {
    width: 100%;
  }
}

/* ---- 平板端（768px ~ 1024px） ---- */
@media (min-width: 768px) and (max-width: 1024px) {
  .my-booth-page {
    padding: 24px;
    max-width: 100%;
  }

  :deep(.ui-card__header) {
    padding: 18px 24px;
  }

  :deep(.ui-card__body) {
    padding: 24px;
  }

  .form-actions button {
    padding: 10px 22px;
    font-size: 0.85rem;
  }
}

/* ---- 桌面端（≥ 1024px） ---- */
@media (min-width: 1025px) {
  .my-booth-page {
    padding: 28px 20px;
  }

  :deep(.ui-card__header) {
    padding: 20px 28px;
  }

  :deep(.ui-card__body) {
    padding: 28px;
  }
}
</style>
