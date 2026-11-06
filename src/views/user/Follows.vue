<template>
  <div class="follows-page">
    <PageHeading title="关注的小店" description="留住喜欢的摊主，下次逛集市更容易找到。" eyebrow="FOLLOWING / 关注" />
    <CollectionToolbar v-model="searchQuery" :count="filteredRows.length" placeholder="搜索摊主或小店名称…" />
    <UiEmpty v-if="searchQuery && !filteredRows.length" description="没有找到匹配的内容，试试其他关键词。" class="search-empty" />
    <UiCard>
      <template #header>
        <div class="follows-header">
          <span>关注列表</span>
          <span class="follow-count" v-if="followList.length > 0">
            共 {{ followList.length }} 位摊主
          </span>
        </div>
      </template>

      <!-- 空状态 -->
      <div v-if="followList.length === 0" class="empty-state">
        <UiEmpty description="还没有关注任何摊主">
          <UiButton type="primary" @click="$router.push('/markets')">
            去逛逛集市
          </UiButton>
        </UiEmpty>
      </div>

      <!-- 关注列表 -->
      <div v-else class="follow-list">
        <div
          v-for="item in filteredRows"
          :key="item.vendorId"
          class="follow-item"
          :class="{ clickable: !!item.boothId }"
          @click="goToBooth(item)"
        >
          <div class="vendor-info">
            <!-- 头像 -->
            <UiImage
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
                <span class="booth-position" v-if="item.boothPosition">
                  {{ item.boothPosition }}
                </span>
              </div>
              <div class="booth-info" v-else>
                <span class="booth-empty">暂无摊位</span>
              </div>
            </div>
          </div>
          <button class="btn-unfollow btn-sm" @click.stop="handleUnfollow(item.vendorId)">
            取消关注
          </button>
        </div>
      </div>
    </UiCard>
  </div>
</template>

<script setup>
import CollectionToolbar from '@/components/CollectionToolbar.vue'
import { useCollectionSearch } from '@/composables/useCollectionSearch'
import PageHeading from '@/components/PageHeading.vue'
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

const { searchQuery, filteredRows } = useCollectionSearch(() => followList.value, ['vendorName', 'nickname', 'boothTitle', 'boothPosition'])
</script>
