<template>
  <div class="my-booth-page">
    <el-card v-if="vendorStore.myBooth">
      <template #header>
        <div class="card-header">
          <span>我的摊位</span>
          <el-tag type="warning">{{ vendorStore.myBooth.status }}</el-tag>
        </div>
      </template>
      <el-form :model="form" label-width="80px" @submit.prevent>
        <el-form-item label="摊位名称">
          <el-input v-model="form.title" />
        </el-form-item>
        <el-form-item label="主营描述">
          <el-input v-model="form.description" type="textarea" />
        </el-form-item>
        <el-form-item label="营业时间">
          <el-input v-model="form.openTime" placeholder="如 08:00-20:00" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="saving" @click="save">保存修改</el-button>
          <el-button type="warning" @click="handleChangeBooth">更换摊位</el-button>
          <el-button type="danger" @click="handleReturnBooth">归还摊位</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card v-else class="empty-card">
      <div class="empty-tip">您还没有已占用的摊位</div>
    </el-card>
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
.my-booth-page { padding: 20px; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.empty-card { margin-top: 20px; }
.empty-tip { text-align: center; color: #909399; padding: 40px; }
</style>