<template>
  <div class="follows-page">
    <el-card>
      <template #header>
        <span>我的关注</span>
      </template>
      <div v-if="followList.length === 0" class="empty-tip">暂无关注</div>
      <div v-else class="follow-list">
        <div
          v-for="item in followList"
          :key="item.vendorId"
          class="follow-item"
          :class="{ clickable: !!item.boothId }"
          @click="goToBooth(item)"
        >
          <div class="vendor-info">
            <!-- 头像 -->
            <el-image
              v-if="item.avatar"
              :src="getFullUrl(item.avatar)"
              fit="cover"
              class="avatar"
            />
            <div v-else class="avatar-placeholder">
              {{ item.vendorName?.charAt(0) || 'V' }}
            </div>
            <div class="vendor-detail">
              <span class="vendor-name">{{ item.vendorName }}</span>
              <div class="booth-info" v-if="item.boothTitle">
                <span class="booth-title">{{ item.boothTitle }}</span>
                <span class="booth-position">{{ item.boothPosition }}</span>
              </div>
            </div>
          </div>
          <el-button type="danger" size="small" @click.stop="handleUnfollow(item.vendorId)">取消关注</el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserMarketStore } from '@/store/modules/userMarket'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getFullUrl } from '@/utils/urlHelper'

const router = useRouter()
const store = useUserMarketStore()
const followList = computed(() => store.followList)

onMounted(async () => {
  try {
    await store.fetchFollowList()
  } catch (e) {
    ElMessage.error('获取关注列表失败')
  }
})

const goToBooth = (item) => {
  if (item.boothId) {
    router.push(`/booth/${item.boothId}`)
  } else {
    ElMessage.info('该摊主暂无摊位')
  }
}

const handleUnfollow = (vendorId) => {
  ElMessageBox.confirm('确定要取消关注吗？', '提示', { type: 'warning' }).then(async () => {
    try {
      await store.unfollow(vendorId)
      ElMessage.success('已取消关注')
    } catch (e) {
      ElMessage.error(e.message || '操作失败')
    }
  })
}
</script>

<style scoped>
.follows-page { padding: 20px; }
.follow-list { display: flex; flex-direction: column; gap: 10px; }
.follow-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  transition: all 0.2s;
}
.follow-item.clickable {
  cursor: pointer;
}
.follow-item.clickable:hover {
  background: #f9fafc;
  border-color: #d9ecff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
.vendor-info {
  display: flex;
  align-items: center;
  gap: 14px;
  flex: 1;
}
.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #eee;
  flex-shrink: 0;
}
.avatar-placeholder {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #409eff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
  flex-shrink: 0;
}
.vendor-detail {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.vendor-name {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}
.booth-info {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  color: #909399;
}
.booth-title {
  color: #606266;
}
.booth-position {
  padding-left: 12px;
  border-left: 1px solid #dcdfe6;
}
.empty-tip { text-align: center; padding: 40px; color: #909399; }
</style>