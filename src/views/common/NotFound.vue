<template>
  <div>404</div>
</template>

<script>
import router from "@/router";
  import { useUserStore } from '@/store/modules/user'
  const userStore = useUserStore()
     console.log("ttt:",router.getRoutes(),"sss:",userStore.dynamicAdded);
</script>