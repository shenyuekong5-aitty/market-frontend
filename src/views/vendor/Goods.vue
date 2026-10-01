<template>
  <div class="goods-page">
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
            <span class="header-title">我的商品</span>
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
        <p>暂无商品</p>
        <p class="empty-hint">点击右上角「新增商品」开始上架</p>
      </div>

      <!-- 非空状态 -->
      <div v-else>
        <!-- 桌面/平板：表格 -->
        <div class="table-wrapper">
          <UiTable :data="vendorStore.productList" border style="width: 100%" class="product-table">
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
          <div v-for="product in vendorStore.productList" :key="product.id" class="product-card">
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
</script>

<style scoped>
/* ============================================================
   1. 设计 Token
   ============================================================ */
.goods-page {
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
  max-width: 1100px;
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

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-icon {
  font-size: 1.1rem;
}

.header-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text);
}

.count-badge {
  font-size: 0.65rem;
  font-weight: 500;
  color: var(--text-secondary);
  background: var(--line);
  padding: 0 10px;
  border-radius: 10px;
  line-height: 20px;
  min-width: 20px;
  text-align: center;
}

/* ============================================================
   4. 按钮
   ============================================================ */
.btn-primary {
  border-radius: 100px;
  background: var(--text);
  border: none;
  font-weight: 500;
  color: #fff;
  cursor: pointer;
  transition: background 0.25s, transform 0.2s;
  padding: 8px 22px;
  font-size: 0.85rem;
}

.btn-primary:hover:not(:disabled) {
  background: var(--accent);
}

.btn-primary:active:not(:disabled) {
  transform: scale(0.97);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-sm {
  padding: 6px 16px;
  font-size: 0.8rem;
}

.btn-xs {
  padding: 4px 12px;
  font-size: 0.7rem;
  border-radius: 100px;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s;
}

.btn-outline {
  border-radius: 100px;
  background: transparent;
  border: 1px solid var(--line);
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.25s;
  padding: 6px 18px;
  font-size: 0.8rem;
}

.btn-outline:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-light);
}

.btn-outline:active {
  transform: scale(0.97);
}

.btn-warning {
  background: #fdf6e8;
  color: #d4a24e;
}

.btn-warning:hover {
  background: #f5e8d0;
}

.btn-success {
  background: var(--green-bg);
  color: var(--green);
}

.btn-success:hover {
  background: #d5e8d5;
}

.btn-danger {
  border-radius: 100px;
  background: transparent;
  border: 1px solid var(--line);
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.25s;
  padding: 4px 12px;
  font-size: 0.7rem;
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
   5. 表格样式
   ============================================================ */
.table-wrapper {
  overflow-x: auto;
  margin: 0 -4px;
}

.product-table {
  border: none !important;
  font-size: 14px;
}

:deep(.product-table.el-table) {
  border: none !important;
}

:deep(.product-table th.el-table__cell) {
  background: var(--surface-subtle) !important;
  color: var(--text-secondary);
  font-weight: 500;
  border-bottom: none;
  padding: 10px 0;
}

:deep(.product-table td.el-table__cell) {
  border-bottom: 1px solid var(--line);
  padding: 12px 0;
}

:deep(.product-table--border) {
  border: none;
}

:deep(.product-table--border .el-table__cell) {
  border-right: none;
}

:deep(.product-table--border .el-table__cell:last-child) {
  border-right: none;
}

:deep(.product-table .cell) {
  padding: 0 6px;
}

:deep(.product-table .el-table__body-wrapper) {
  color: var(--text);
}

.table-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  flex-wrap: wrap;
}

/* ============================================================
   6. 状态标签
   ============================================================ */
.status-badge {
  display: inline-block;
  padding: 2px 12px;
  border-radius: 100px;
  font-size: 0.65rem;
  font-weight: 500;
}

.status-on {
  background-color: var(--green-bg);
  color: var(--green);
}

.status-off {
  background-color: var(--line);
  color: var(--text-muted);
}

.text-success {
  color: var(--green);
}

.text-muted {
  color: var(--text-muted);
}

.image-placeholder {
  color: var(--text-muted);
  font-size: 0.7rem;
}

/* ============================================================
   7. 加载 & 空状态
   ============================================================ */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 60px 20px;
  color: var(--text-muted);
  font-size: 0.9rem;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--line);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 60px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 2.4rem;
  opacity: 0.4;
}

.empty-state p {
  color: var(--text-muted);
  font-size: 0.95rem;
  margin: 0;
}

.empty-hint {
  font-size: 0.8rem;
  color: var(--text-muted);
  opacity: 0.7;
}

/* ============================================================
   8. 弹窗样式 - 修复移动端宽度问题
   ============================================================ */
:global(.ui-dialog.product-dialog) {
  --text: var(--ink-strong);
  --text-secondary: var(--ink);
  --accent: var(--brand-primary);
  --accent-light: var(--brand-primary-soft);
  --radius: var(--radius-md);
  --shadow: var(--shadow-sm);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  margin: 0 auto;
}

:global(.ui-dialog.product-dialog .ui-dialog__header) {
  border-bottom: 1px solid var(--line);
  padding: 18px 24px;
  background: var(--surface-card);
  flex-shrink: 0;
}

:global(.ui-dialog.product-dialog .ui-dialog__header h2) {
  color: var(--text);
  font-weight: 600;
  font-size: 1rem;
}

:global(.ui-dialog.product-dialog .ui-dialog__body) {
  padding: 24px;
  flex: 1;
  overflow-y: auto;
}

:global(.ui-dialog.product-dialog .ui-dialog__footer) {
  border-top: 1px solid var(--line);
  padding: 16px 24px;
  background: var(--surface-card);
  border-radius: 0 0 var(--radius) var(--radius);
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  flex-shrink: 0;
}

:global(.ui-dialog.product-dialog .image-upload .btn-outline),
:global(.ui-dialog.product-dialog .ui-dialog__footer .btn-outline) {
  color: var(--brand-primary);
  background: #fff;
  border: 1px solid var(--brand-primary);
  font-weight: 600;
}

:global(.ui-dialog.product-dialog .image-upload .btn-outline:hover),
:global(.ui-dialog.product-dialog .ui-dialog__footer .btn-outline:hover) {
  color: var(--brand-primary-hover);
  background: var(--brand-primary-soft);
  border-color: var(--brand-primary-hover);
}

:global(.ui-dialog.product-dialog .ui-dialog__footer .btn-primary) {
  color: #fff;
  background: var(--brand-primary);
  border: 1px solid var(--brand-primary);
  font-weight: 600;
}

:global(.ui-dialog.product-dialog .ui-dialog__footer .btn-primary:hover:not(:disabled)) {
  color: #fff;
  background: var(--brand-primary-hover);
  border-color: var(--brand-primary-hover);
}

:global(.ui-dialog.product-dialog .ui-dialog__footer .btn-primary:disabled) {
  color: #fff;
  background: var(--brand-primary);
  opacity: .55;
}

/* 弹窗滚动包装器 */
.dialog-scroll-wrapper {
  max-height: 55vh;
  overflow-y: auto;
  padding-right: 4px;
}

.dialog-scroll-wrapper::-webkit-scrollbar {
  width: 4px;
}

.dialog-scroll-wrapper::-webkit-scrollbar-track {
  background: transparent;
}

.dialog-scroll-wrapper::-webkit-scrollbar-thumb {
  background: var(--line);
  border-radius: 4px;
}

.dialog-form :deep(.el-form-item) {
  margin-bottom: 20px;
}

.dialog-form :deep(.el-form-item__label) {
  color: var(--text-secondary);
  font-weight: 500;
  font-size: 0.85rem;
}

.dialog-input :deep(.el-input__wrapper) {
  border-radius: 100px;
  box-shadow: none !important;
  border: 1px solid var(--line);
  padding: 0 16px;
  height: 42px;
  transition: border-color 0.25s;
}

.dialog-input :deep(.el-input__wrapper.is-focus) {
  border-color: var(--accent);
}

.dialog-input :deep(.el-input__inner) {
  color: var(--text);
  font-size: 0.9rem;
}

.dialog-input-number :deep(.el-input__wrapper) {
  border-radius: 100px;
  box-shadow: none !important;
  border: 1px solid var(--line);
  padding: 0 12px;
  height: 42px;
  transition: border-color 0.25s;
}

.dialog-input-number :deep(.el-input__wrapper.is-focus) {
  border-color: var(--accent);
}

.dialog-input-number :deep(.el-input-number__decrease),
.dialog-input-number :deep(.el-input-number__increase) {
  background: transparent;
  border: none;
  color: var(--text-muted);
}

.dialog-switch :deep(.el-switch__core) {
  border-radius: 100px;
}

.dialog-switch :deep(.el-switch__core .el-switch__action) {
  border-radius: 50%;
}

.dialog-switch :deep(.el-switch.is-checked .el-switch__core) {
  border-color: var(--accent);
  background: var(--accent);
}

.image-upload {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.image-preview {
  position: relative;
  width: 80px;
  height: 80px;
  border: 1px solid var(--line);
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.delete-icon {
  position: absolute;
  top: 4px;
  right: 4px;
  font-size: 16px;
  color: var(--red);
  cursor: pointer;
  background: rgba(255,255,255,0.9);
  border-radius: 50%;
  padding: 2px;
}

/* ============================================================
   9. 移动端卡片列表（默认隐藏）
   ============================================================ */
.product-card-list {
  display: none;
}

/* ============================================================
   10. 响应式适配
   ============================================================ */

/* ---- 移动端（< 768px） ---- */
@media (max-width: 767px) {
  .goods-page {
    padding: 8px;
  }

  :deep(.ui-card__header) {
    padding: 12px 14px;
  }

  :deep(.ui-card__body) {
    padding: 12px 8px;
  }

  .header-title {
    font-size: 0.9rem;
  }

  .header-icon {
    font-size: 0.95rem;
  }

  .btn-sm {
    padding: 4px 12px;
    font-size: 0.7rem;
  }

  /* 隐藏表格 */
  .table-wrapper {
    display: none;
  }

  /* 显示卡片列表 */
  .product-card-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 4px 0;
  }

  .product-card {
    background: #ffffff;
    border-radius: 14px;
    padding: 14px 14px 12px;
    border: 1px solid var(--line);
  }

  .product-card-row {
    display: flex;
    align-items: flex-start;
    gap: 12px;
  }

  .product-card-image {
    flex-shrink: 0;
  }
  .product-card-image .el-image {
    width: 60px !important;
    height: 60px !important;
    border-radius: 10px;
    object-fit: cover;
  }

  .product-card-info {
    flex: 1;
    min-width: 0;
  }

  .product-card-name {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text);
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .product-card-meta {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 4px;
  }

  .product-card-price {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text);
  }

  .product-card-stock {
    font-size: 0.7rem;
    color: var(--text-muted);
  }

  .product-card-tags {
    display: flex;
    gap: 6px;
    margin-top: 6px;
    flex-wrap: wrap;
  }

  .product-card-tags .status-badge {
    font-size: 0.6rem;
    padding: 1px 10px;
  }

  .tag-reserve {
    font-size: 0.6rem;
    padding: 1px 10px;
    border-radius: 100px;
    background: var(--brand-primary-soft);
    color: var(--accent);
  }

  .product-card-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid var(--line);
  }

  .product-card-actions .btn-xs {
    flex: 1;
    min-width: 50px;
    padding: 6px 8px;
    font-size: 0.7rem;
    text-align: center;
  }

  /* ==========================================================
     弹窗移动端适配 - 核心修复
     ========================================================== */
  :global(.ui-dialog.product-dialog) {
    width: 92% !important;
    max-width: 92% !important;
    min-width: unset !important;
    margin: 10px auto !important;
    top: 5vh !important;
    max-height: 90vh !important;
    transform: none !important;
    left: 0 !important;
    right: 0 !important;
  }

  :global(.ui-dialog.product-dialog .ui-dialog__header) {
    padding: 12px 16px;
  }

  :global(.ui-dialog.product-dialog .ui-dialog__body) {
    padding: 16px 16px 8px;
    overflow-y: auto;
    max-height: 60vh;
  }

  :global(.ui-dialog.product-dialog .ui-dialog__footer) {
    padding: 12px 16px;
    flex-wrap: wrap;
    gap: 8px;
  }

  :global(.ui-dialog.product-dialog .ui-dialog__footer button) {
    flex: 1;
    min-width: 70px;
    justify-content: center;
    padding: 10px 16px;
    font-size: 0.85rem;
  }

  :global(.ui-dialog.product-dialog .ui-dialog__footer .btn-primary) {
    padding: 10px 16px;
    font-size: 0.85rem;
  }

  :global(.ui-dialog.product-dialog .ui-dialog__footer .btn-outline) {
    padding: 10px 16px;
    font-size: 0.85rem;
  }

  /* 弹窗滚动包装器 - 移动端调整 */
  .dialog-scroll-wrapper {
    max-height: 55vh;
    padding-right: 2px;
  }

  .dialog-form :deep(.el-form-item) {
    margin-bottom: 14px;
  }

  .dialog-form :deep(.el-form-item__label) {
    font-size: 0.8rem;
    padding-bottom: 4px;
    line-height: 1.4;
    width: 70px !important;
  }

  .dialog-input :deep(.el-input__wrapper) {
    height: 38px;
    padding: 0 14px;
  }

  .dialog-input-number :deep(.el-input__wrapper) {
    height: 38px;
    padding: 0 10px;
  }

  .dialog-input-number :deep(.el-input-number__decrease),
  .dialog-input-number :deep(.el-input-number__increase) {
    width: 28px;
    height: 28px;
    font-size: 14px;
  }

  .image-upload {
    gap: 8px;
  }

  .image-preview {
    width: 64px;
    height: 64px;
  }

  .image-preview .delete-icon {
    font-size: 14px;
    top: 2px;
    right: 2px;
    padding: 1px;
  }

  .image-upload .btn-outline {
    padding: 4px 14px;
    font-size: 0.75rem;
  }

  .empty-state {
    padding: 40px 16px;
  }
}

/* ---- 平板端（768px ~ 1024px） ---- */
@media (min-width: 768px) and (max-width: 1024px) {
  .goods-page {
    padding: 24px;
    max-width: 100%;
  }

  :deep(.ui-card__header) {
    padding: 16px 20px;
  }

  :deep(.ui-card__body) {
    padding: 20px;
  }

  .product-table {
    font-size: 13px;
  }

  :deep(.product-table th.el-table__cell) {
    padding: 8px 0;
  }

  :deep(.product-table td.el-table__cell) {
    padding: 10px 0;
  }

  .btn-xs {
    padding: 3px 10px;
    font-size: 0.65rem;
  }

  .table-actions {
    gap: 4px;
  }

  :global(.ui-dialog.product-dialog) {
    width: 90% !important;
    max-height: 90vh;
  }

  .dialog-scroll-wrapper {
    max-height: 55vh;
  }
}

/* ---- 桌面端（≥ 1024px） ---- */
@media (min-width: 1025px) {
  .goods-page {
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
