<template>
  <div class="my-booth-page">
    <PageHeading title="我的摊位" description="完善小店介绍与营业时间，让顾客更了解你。" eyebrow="MY SHOP / 摊位" />
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
import PageHeading from '@/components/PageHeading.vue'
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
