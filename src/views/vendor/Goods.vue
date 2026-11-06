<template>
  <div class="goods-page">
    <PageHeading title="商品管理" description="整理商品、维护库存，让每一件好物都准备就绪。" eyebrow="PRODUCTS / 商品" />
    <CollectionToolbar v-model="searchQuery" :count="filteredRows.length" placeholder="搜索商品名称或上架状态…" />
    <UiEmpty v-if="searchQuery && !filteredRows.length" description="没有找到匹配的内容，试试其他关键词。" class="search-empty" />
    <UiCard>
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <span class="header-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
            </svg>
          </span>
            <span class="header-title">商品目录</span>
            <span v-if="vendorStore.productList.length > 0" class="count-badge">
              {{ vendorStore.productList.length }}
            </span>
          </div>
          <button
            class="btn-primary btn-sm"
            :disabled="!vendorStore.myBooth"
            @click="openAddDialog"
          >
            + 新增商品
          </button>
        </div>
      </template>

      <!-- 加载状态 -->
      <div v-if="vendorStore.productLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <span>加载中...</span>
      </div>

      <!-- 空状态 -->
      <div v-else-if="vendorStore.productList.length === 0" class="empty-state">
        <div class="empty-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              <rect x="3" y="18" width="18" height="2" rx="1"/>
            </svg>
          </div>
        <p>{{ vendorStore.myBooth ? '暂无商品' : '还没有可经营的摊位' }}</p>
        <p class="empty-hint">
          {{ vendorStore.myBooth ? '点击右上角「新增商品」开始上架' : '先申请摊位，审批通过后即可上架商品' }}
        </p>
        <router-link v-if="!vendorStore.myBooth" to="/vendor/market-select" class="btn-primary empty-action">去选择集市</router-link>
      </div>

      <!-- 非空状态 -->
      <div v-else>
        <!-- 桌面/平板：表格 -->
        <div class="table-wrapper">
          <UiTable :data="filteredRows" border style="width: 100%" class="product-table">
            <UiTableColumn prop="id" label="ID" width="60" />
            <UiTableColumn label="图片" width="80">
              <template #default="{ row }">
                <UiImage
                  v-if="row.imageUrl"
                  :src="getFullUrl(row.imageUrl)"
                  fit="cover"
                  style="width: 44px; height: 44px; border-radius: 8px;"
                  :preview-src-list="[getFullUrl(row.imageUrl)]"
                />
                <span v-else class="image-placeholder">无</span>
              </template>
            </UiTableColumn>
            <UiTableColumn prop="name" label="商品名称" min-width="120" />
            <UiTableColumn prop="price" label="价格" width="90" align="center" />
            <UiTableColumn prop="stock" label="库存" width="80" align="center" />
            <UiTableColumn label="预定" width="80" align="center">
              <template #default="{ row }">
                <span :class="row.canReserve === 1 ? 'text-success' : 'text-muted'">
                  {{ row.canReserve === 1 ? '支持' : '不支持' }}
                </span>
              </template>
            </UiTableColumn>
            <UiTableColumn label="状态" width="80" align="center">
              <template #default="{ row }">
                <span class="status-badge" :class="row.saleStatus === '上架' ? 'status-on' : 'status-off'">
                  {{ row.saleStatus }}
                </span>
              </template>
            </UiTableColumn>
            <UiTableColumn label="操作" width="280" align="center">
              <template #default="{ row }">
                <div class="table-actions">
                  <button class="btn-outline btn-xs" @click="openEditDialog(row)">编辑</button>
                  <button
                    class="btn-xs"
                    :class="row.saleStatus === '上架' ? 'btn-warning' : 'btn-success'"
                    @click="handleToggleStatus(row.id)"
                  >
                    {{ row.saleStatus === '上架' ? '下架' : '上架' }}
                  </button>
                  <button class="btn-danger btn-xs" @click="handleDelete(row.id)">删除</button>
                </div>
              </template>
            </UiTableColumn>
          </UiTable>
        </div>

        <!-- 移动端：卡片列表 -->
        <div class="product-card-list">
          <div v-for="product in filteredRows" :key="product.id" class="product-card">
            <div class="product-card-row">
              <div class="product-card-image">
                <UiImage
                  v-if="product.imageUrl"
                  :src="getFullUrl(product.imageUrl)"
                  fit="cover"
                  style="width: 60px; height: 60px; border-radius: 10px;"
                  :preview-src-list="[getFullUrl(product.imageUrl)]"
                />
                <span v-else class="image-placeholder">无图</span>
              </div>
              <div class="product-card-info">
                <div class="product-card-name">{{ product.name }}</div>
                <div class="product-card-meta">
                  <span class="product-card-price">¥{{ Number(product.price).toFixed(2) }}</span>
                  <span class="product-card-stock">库存 {{ product.stock }}</span>
                </div>
                <div class="product-card-tags">
                  <span class="status-badge" :class="product.saleStatus === '上架' ? 'status-on' : 'status-off'">
                    {{ product.saleStatus }}
                  </span>
                  <span v-if="product.canReserve === 1" class="tag-reserve">可预定</span>
                </div>
              </div>
            </div>
            <div class="product-card-actions">
              <button class="btn-outline btn-xs" @click="openEditDialog(product)">编辑</button>
              <button
                class="btn-xs"
                :class="product.saleStatus === '上架' ? 'btn-warning' : 'btn-success'"
                @click="handleToggleStatus(product.id)"
              >
                {{ product.saleStatus === '上架' ? '下架' : '上架' }}
              </button>
              <button class="btn-danger btn-xs" @click="handleDelete(product.id)">删除</button>
            </div>
          </div>
        </div>
      </div>
    </UiCard>

    <!-- ===== 新增/编辑商品弹窗 - 修复手机端宽度 ===== -->
    <UiDialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑商品' : '新增商品'"
      class="product-dialog"
      :width="dialogWidth"
      @close="resetForm"
    >
      <div class="dialog-scroll-wrapper">
        <el-form ref="formRef" :model="form" :rules="rules" label-width="80px" class="dialog-form" @submit.prevent>
          <UiFormItem label="商品名称" prop="name">
            <UiInput v-model="form.name" placeholder="请输入商品名称" class="dialog-input" />
          </UiFormItem>
          <UiFormItem label="价格" prop="price">
            <UiInputNumber
              v-model="form.price"
              :min="0"
              :precision="2"
              style="width: 100%"
              class="dialog-input-number"
            />
          </UiFormItem>
          <UiFormItem label="库存" prop="stock">
            <UiInputNumber
              v-model="form.stock"
              :min="0"
              style="width: 100%"
              class="dialog-input-number"
            />
          </UiFormItem>
          <UiFormItem label="支持预定">
            <UiSwitch
              v-model="form.canReserve"
              :active-value="1"
              :inactive-value="0"
              class="dialog-switch"
            />
          </UiFormItem>
          <UiFormItem label="商品图片">
            <div class="image-upload">
              <input
                type="file"
                ref="imageInputRef"
                accept="image/*"
                style="display: none"
                @change="handleImageChange"
              />
              <div class="image-preview" v-if="form.imageUrl">
                <img :src="getFullUrl(form.imageUrl)" />
                <el-icon class="delete-icon" @click="form.imageUrl = ''">
                  <Close />
                </el-icon>
              </div>
              <button v-else type="button" class="btn-outline btn-sm" @click="triggerImageInput">
                + 上传图片
              </button>
            </div>
          </UiFormItem>
        </el-form>
      </div>
      <template #footer>
        <button type="button" class="btn-outline" @click="dialogVisible = false">取消</button>
        <button type="button" class="btn-primary" :disabled="saving" @click="handleSubmit">
          {{ saving ? '保存中...' : '确定' }}
        </button>
      </template>
    </UiDialog>
  </div>
</template>

<script setup>
import CollectionToolbar from '@/components/CollectionToolbar.vue'
import { useCollectionSearch } from '@/composables/useCollectionSearch'
import PageHeading from '@/components/PageHeading.vue'
import { ref, reactive, onMounted, computed } from 'vue'
import { useVendorStore } from '@/store/modules/vendor'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Close } from '@element-plus/icons-vue'
import { getFullUrl } from '@/utils/urlHelper'
import { useDevice } from '@/composables/useDevice'

const vendorStore = useVendorStore()
const { isMobile } = useDevice()

const dialogVisible = ref(false)
const isEdit = ref(false)
const saving = ref(false)
const formRef = ref(null)
const imageInputRef = ref(null)
const editingId = ref(null)

// 动态计算弹窗宽度和顶部位置
const dialogWidth = computed(() => {
  if (isMobile.value) {
    return '92%'
  }
  return '500px'
})

const form = reactive({
  name: '',
  price: 0,
  stock: 0,
  canReserve: 1,
  imageUrl: '',
  boothId: null
})

const rules = {
  name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  price: [{ required: true, message: '请输入价格', trigger: 'blur' }],
  stock: [{ required: true, message: '请输入库存', trigger: 'blur' }]
}

const openAddDialog = () => {
  if (!vendorStore.myBooth) {
    ElMessage.warning('您还没有已占用的摊位，无法添加商品')
    return
  }
  form.boothId = vendorStore.myBooth.id
  isEdit.value = false
  editingId.value = null
  form.name = ''
  form.price = 0
  form.stock = 0
  form.canReserve = 1
  form.imageUrl = ''
  dialogVisible.value = true
}

const openEditDialog = (row) => {
  isEdit.value = true
  editingId.value = row.id
  form.name = row.name
  form.price = row.price
  form.stock = row.stock
  form.canReserve = row.canReserve
  form.imageUrl = row.imageUrl || ''
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    saving.value = true
    try {
      if (isEdit.value) {
        await vendorStore.editProduct(editingId.value, { ...form })
        ElMessage.success('商品已更新')
      } else {
        await vendorStore.createProduct({ ...form })
        ElMessage.success('商品已添加')
      }
      dialogVisible.value = false
    } catch (e) {
      ElMessage.error(e.message || '操作失败')
    } finally {
      saving.value = false
    }
  })
}

const handleToggleStatus = async (id) => {
  try {
    await vendorStore.switchProductStatus(id)
    ElMessage.success('状态已更新')
  } catch (e) {
    ElMessage.error(e.message || '操作失败')
  }
}

const handleDelete = (id) => {
  ElMessageBox.confirm('确定要删除该商品吗？', '提示', { type: 'warning' }).then(async () => {
    try {
      await vendorStore.removeProduct(id)
      ElMessage.success('商品已删除')
    } catch (e) {
      ElMessage.error(e.message || '删除失败')
    }
  })
}

const triggerImageInput = () => {
  imageInputRef.value?.click()
}

const handleImageChange = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return
  if (!file.type.startsWith('image/')) {
    ElMessage.warning('请选择图片文件')
    return
  }
  if (file.size > 2 * 1024 * 1024) {
    ElMessage.warning('图片大小不能超过2MB')
    return
  }
  const formData = new FormData()
  formData.append('file', file)
  try {
    const url = await vendorStore.uploadProductImg(formData)
    form.imageUrl = url
    ElMessage.success('图片上传成功')
  } catch (e) {
    ElMessage.error('图片上传失败')
  }
  event.target.value = ''
}

const resetForm = () => {
  formRef.value?.resetFields()
}

onMounted(() => {
  vendorStore.init()
})

const { searchQuery, filteredRows } = useCollectionSearch(() => vendorStore.productList, ['name', 'saleStatus'])
</script>
