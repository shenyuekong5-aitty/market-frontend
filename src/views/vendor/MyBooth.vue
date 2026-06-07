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
          <el-button type="primary" :loading="vendorStore.saving" @click="save">保存修改</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card v-else class="empty-card">
      <div class="empty-tip">您还没有已占用的摊位</div>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, onMounted } from 'vue'
import { useVendorStore } from '@/store/modules/vendor'
import { ElMessage } from 'element-plus'

const vendorStore = useVendorStore()

const form = reactive({
  title: '',
  description: '',
  openTime: ''
})

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
  try {
    await vendorStore.saveMyBooth({
      title: form.title,
      description: form.description,
      openTime: form.openTime
    })
    ElMessage.success('摊位信息已更新')
    // 重新加载
    await loadBooth()
  } catch (e) {
    ElMessage.error(e.message || '保存失败')
  }
}

onMounted(() => {
  loadBooth()
})
</script>

<style scoped>
.my-booth-page {
  padding: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.empty-card {
  margin-top: 20px;
}
.empty-tip {
  text-align: center;
  color: #909399;
  padding: 40px;
}
</style>