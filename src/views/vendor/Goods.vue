<template>
  <div class="goods-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>商品管理</span>
          <el-button
            type="primary"
            size="small"
            :disabled="!vendorStore.myBooth"
            @click="openAddDialog"
          >
            新增商品
          </el-button>
        </div>
      </template>

      <el-table
        :data="vendorStore.productList"
        border
        style="width: 100%"
        v-loading="vendorStore.productLoading"
      >
        <el-table-column prop="id" label="ID" width="60" />
        <!-- 新增图片列 -->
        <el-table-column label="图片" width="80">
          <template #default="{ row }">
            <el-image
              v-if="row.imageUrl"
              :src="getFullUrl(row.imageUrl)"
              fit="cover"
              style="width: 50px; height: 50px; border-radius: 4px;"
              :preview-src-list="[getFullUrl(row.imageUrl)]"
            />
            <span v-else style="color: #c0c4cc;">暂无</span>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="商品名称" />
        <el-table-column prop="price" label="价格" />
        <el-table-column prop="stock" label="库存" />
        <el-table-column label="预定" width="80">
          <template #default="{ row }">
            {{ row.canReserve === 1 ? '支持' : '不支持' }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.saleStatus === '上架' ? 'success' : 'info'">
              {{ row.saleStatus }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="260">
          <template #default="{ row }">
            <el-button size="small" @click="openEditDialog(row)">编辑</el-button>
            <el-button
              size="small"
              :type="row.saleStatus === '上架' ? 'warning' : 'success'"
              @click="handleToggleStatus(row.id)"
            >
              {{ row.saleStatus === '上架' ? '下架' : '上架' }}
            </el-button>
            <el-button size="small" type="danger" @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑商品弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑商品' : '新增商品'"
      width="500px"
      @close="resetForm"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input-number v-model="form.price" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="库存" prop="stock">
          <el-input-number v-model="form.stock" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="支持预定">
          <el-switch v-model="form.canReserve" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item label="商品图片">
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
            <el-button v-else type="primary" plain @click="triggerImageInput">
              <el-icon><Plus /></el-icon> 上传图片
            </el-button>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useVendorStore } from '@/store/modules/vendor'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Close, Plus } from '@element-plus/icons-vue'
import { getFullUrl } from '@/utils/urlHelper'

const vendorStore = useVendorStore()

const dialogVisible = ref(false)
const isEdit = ref(false)
const saving = ref(false)
const formRef = ref(null)
const imageInputRef = ref(null)
const editingId = ref(null)

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

function getFullImageUrl(url) {
  return getFullUrl(url)
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
.goods-page {
  padding: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.image-upload {
  display: flex;
  align-items: center;
  gap: 12px;
}
.image-preview {
  position: relative;
  width: 120px;
  height: 120px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
}
.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.delete-icon {
  position: absolute;
  top: 2px;
  right: 2px;
  font-size: 18px;
  color: #f56c6c;
  cursor: pointer;
  background: rgba(255,255,255,0.8);
  border-radius: 50%;
}
</style>