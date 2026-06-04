<template>
  <!-- 无子节点 或 仅有一个子节点：直接渲染为菜单项 -->
  <el-menu-item
    v-if="!item.children || item.children.length === 0 || item.children.length === 1"
    :index="resolvePath(item)"
  >
    <el-icon v-if="item.meta?.icon">
      <component :is="item.meta.icon" />
    </el-icon>
    <template #title>{{ item.meta?.title || item.name }}</template>
  </el-menu-item>

  <!-- 多个子节点：渲染为可展开的父菜单 -->
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
  item: { type: Object, required: true }
})

function resolvePath(item) {
  if (item.children && item.children.length === 1) {
    return '/' + item.children[0].path
  }
  return '/' + item.path
}
</script>