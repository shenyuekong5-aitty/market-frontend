<template>
  <div class="market-select-page">
    <h3>{{ isChangeMode ? '选择新摊位（更换）' : '选择入驻集市' }}</h3>
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
            <span v-if="isChangeMode" style="color: #e6a23c; margin-left: 10px;">（更换模式）</span>
          </template>
          <el-table :data="boothList" border style="width: 100%" v-loading="boothLoading">
            <el-table-column prop="id" label="ID" width="60" />
            <el-table-column prop="title" label="名称" />
            <el-table-column prop="position" label="位置" />
            <el-table-column prop="description" label="描述" />
            <el-table-column label="操作" width="140">
              <template #default="{ row }">
                <!-- 普通用户申请入住（角色为user且非更换模式） -->
                <el-button
                  v-if="!isChangeMode && isUserRole && !row.hasPendingApply"
                  type="primary"
                  size="small"
                  @click="handleApply(row.id)"
                >
                  申请入住
                </el-button>
                <span v-else-if="!isChangeMode && isUserRole && row.hasPendingApply" style="color: #c0c4cc;">等待审批</span>

                <!-- 更换模式按钮（任何角色在更换模式下都显示） -->
                <el-button
                  v-if="isChangeMode"
                  type="warning"
                  size="small"
                  @click="handleChange(row.id)"
                >
                  更换至此
                </el-button>
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
import { useRoute, useRouter } from 'vue-router'
import { useMarketStore } from '@/store/modules/market'
import { useVendorStore } from '@/store/modules/vendor'
import { useUserStore } from '@/store/modules/user'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const marketStore = useMarketStore()
const vendorStore = useVendorStore()
const userStore = useUserStore()

// 是否为更换模式
const isChangeMode = computed(() => route.query.mode === 'change')
// 当前用户是否为普通用户（只有普通用户可以申请入住）
const isUserRole = computed(() => userStore.userInfo.role === 'user')

const activeMarketId = ref(null)
const boothList = ref([])
const boothLoading = ref(false)
const selectedMarket = ref(null)

//setting
const changing = ref(false)

const loadMarkets = async () => {
  try {
    await marketStore.fetchMarkets()
  } catch (e) {
    ElMessage.error('获取集市列表失败')
  }
}

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

// 申请入住（普通用户）
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

// 更换摊位（小贩）
const handleChange = async (targetBoothId) => {
  if (changing.value) return
  changing.value = true
  try {
    await vendorStore.submitChangeBooth(targetBoothId)
    ElMessage.success('更换申请已提交，请等待管理员审批')
    router.push('/vendor/my-booth')
  } catch (e) {
    ElMessage.error(e.message || '申请失败')
  } finally {
    changing.value = false
  }
}

onMounted(async () => {
  // 如果当前用户是 vendor 且已有摊位，但不是更换模式，则自动切换到更换模式
  if (userStore.userInfo.role === 'vendor') {
    if (!isChangeMode.value) {
      router.replace({ query: { mode: 'change' } })
      return
    }
  }
  loadMarkets()
})
</script>

<style scoped>
.market-select-page { padding: 20px; }
.empty-tip { text-align: center; color: #909399; padding: 40px; }
</style>