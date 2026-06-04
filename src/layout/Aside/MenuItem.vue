<template>
  <!-- 无子节点 或 仅有一个子节点：直接渲染为菜单项 -->
  <el-menu-item
    v-if="
      !item.children || item.children.length === 0 || item.children.length === 1
    "
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
    <MenuItem v-for="child in item.children" :key="child.path" :item="child" />
  </el-sub-menu>
</template>

<script setup>
defineProps({
  item: { type: Object, required: true },
});

function resolvePath(item) {
  // 情况1：只有一个子节点时，跳转到子节点的完整绝对路径
  if (item.children && item.children.length === 1) {
    return "/" + item.children[0].path;
  }
  // 情况2：没有子节点，跳转自身的完整绝对路径
  return "/" + item.path;
}

//函数说明：
//路由定义中使用的是相对路径（如 admin/dashboard），因为动态添加子路由时 Vue Router 要求路径是相对的。
//但 el-menu 的 router 模式需要 index 是一个完整的绝对路径（如 /admin/dashboard）才能正确跳转。
</script>
