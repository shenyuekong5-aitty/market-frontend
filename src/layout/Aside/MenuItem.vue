<template>
  <!-- 没有子节点 或 只有一个子节点：直接渲染为可跳转的菜单项 -->
  <el-menu-item
    v-if="!item.children || item.children.length === 0 || item.children.length === 1"
    :index="resolvePath(item)"
  >
    <el-icon v-if="item.meta?.icon">
      <component :is="item.meta.icon" />
    </el-icon>
    <template #title>{{ item.meta?.title || item.name }}</template>
  </el-menu-item>

  <!-- 有多个子节点：渲染为可展开的父菜单，并递归调用自身 -->
  <el-sub-menu v-else :index="item.path">
    <template #title>
      <el-icon v-if="item.meta?.icon">
        <component :is="item.meta.icon" />
      </el-icon>
      <span>{{ item.meta?.title || item.name }}</span>
    </template>
    <MenuItem
      v-for="child in item.children"
      :key="child.path"
      :item="child"
    />
  </el-sub-menu>
</template>

<script setup>
defineProps({
  item: {
    type: Object,
    required: true
  }
})

/**
 * 解析最终跳转路径：
 * - 如果当前节点没有子节点，直接返回自己的 path
 * - 如果当前节点只有一个子节点，返回子节点的 path（跳过中间层）
 */
function resolvePath(item) {
  if (item.children && item.children.length === 1) {
    return item.children[0].path
  }
  return item.path
}
</script>