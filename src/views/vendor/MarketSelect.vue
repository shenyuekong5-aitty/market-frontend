<template>
  <div class="market-select-page">
    <!-- 标题根据角色自动切换 -->
    <h3>{{ isVendorRole ? '选择新摊位（更换）' : '选择入驻集市' }}</h3>
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card>
          <template #header>可选集市</template>
          <div v-if="marketStore.marketList.length === 0">暂无可用集市</div>
          <el-menu v-else :default-active="activeMarketId" @select="handleMarketSelect">
            <el-menu-item v-for="m in marketStore.marketList" :key="m.id" :index="String(m.id)">
              <span>{{ m.name }}</span>
              <span style="margin-left: auto; color: #909399; font-size: 12px;">{{ m.location }}</span>
            </el-menu-item>
          </el-menu>
        </el-card>
      </el-col>

      <el-col :span="16">
        <el-card v-if="activeMarketId">
          <template #header>
            空闲摊位 - {{ selectedMarket?.name }}
            <span v-if="isVendorRole" style="color: #e6a23c; margin-left: 10px;">（更换模式）</span>
          </template>
          <el-table :data="boothList" border style="width: 100%" v-loading="boothLoading">
            <el-table-column prop="id" label="ID" width="60" />
            <el-table-column prop="title" label="名称" />
            <el-table-column prop="position" label="位置" />
            <el-table-column prop="description" label="描述" />
            <el-table-column label="操作" width="140">
              <template #default="{ row }">
                <!-- vendor 角色：显示更换至此 -->
                <el-button
                  v-if="isVendorRole"
                  type="warning"
                  size="small"
                  @click="handleChange(row.id)"
                >
                  更换至此
                </el-button>
                <!-- user 角色：显示申请入住或等待审批 -->
                <template v-else>
                  <el-button
                    v-if="!row.hasPendingApply"
                    type="primary"
                    size="small"
                    @click="handleApply(row.id)"
                  >
                    申请入住
                  </el-button>
                  <span v-else style="color: #c0c4cc;">等待审批</span>
                </template>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
        <el-card v-else>
          <div class="empty-tip">请从左侧选择一个集市</div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMarketStore } from '@/store/modules/market'
import { useVendorStore } from '@/store/modules/vendor'
import { useUserStore } from '@/store/modules/user'
import { ElMessage } from 'element-plus'

const router = useRouter()
const marketStore = useMarketStore()
const vendorStore = useVendorStore()
const userStore = useUserStore()

// 根据角色自动判断是否为 vendor（无需路由参数）
const isVendorRole = computed(() => userStore.userInfo.role === 'vendor')

const activeMarketId = ref(null)
const boothList = ref([])
const boothLoading = ref(false)
const selectedMarket = ref(null)

// 加载集市列表
const loadMarkets = async () => {
  try {
    await marketStore.fetchMarkets()
  } catch (e) {
    ElMessage.error('获取集市列表失败')
  }
}

// 选中一个集市，加载空闲摊位
const handleMarketSelect = async (index) => {
  activeMarketId.value = index
  selectedMarket.value = marketStore.marketList.find(m => m.id === Number(index))
  boothLoading.value = true
  try {
    await marketStore.fetchFreeBooths(Number(index))
    boothList.value = marketStore.boothList
  } catch (e) {
    ElMessage.error('获取摊位列表失败')
  } finally {
    boothLoading.value = false
  }
}

// user 申请入住
const handleApply = async (boothId) => {
  try {
    await vendorStore.submitBoothApplication(boothId)
    ElMessage.success('申请已提交，请等待管理员审批')
    await marketStore.fetchFreeBooths(Number(activeMarketId.value))
    boothList.value = marketStore.boothList
  } catch (e) {
    ElMessage.error(e.message || '申请失败')
  }
}

// vendor 更换摊位
const handleChange = async (targetBoothId) => {
  try {
    await vendorStore.submitChangeBooth(targetBoothId)
    ElMessage.success('更换申请已提交，请等待管理员审批')
    router.push('/vendor/my-booth')
  } catch (e) {
    ElMessage.error(e.message || '申请失败')
  }
}

onMounted(() => {
  loadMarkets()
})
</script>

<style scoped>
.market-select-page { padding: 20px; }
.empty-tip { text-align: center; color: #909399; padding: 40px; }
</style>