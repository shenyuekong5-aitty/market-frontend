<template>
  <div class="login-container">
    <div class="login-card">
      <h2>智慧集市管理系统</h2>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="0">
        <el-form-item prop="username">
          <el-input
            v-model="form.username"
            placeholder="账号 / 手机号"
            prefix-icon="User"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="密码"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        <el-form-item prop="role">
          <el-select
            v-model="form.role"
            placeholder="请选择登录角色"
            style="width: 100%"
          >
            <el-option label="管理员" value="admin" />
            <el-option label="小贩" value="vendor" />
            <el-option label="普通用户" value="user" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            :loading="loading"
            @click="handleLogin"
            style="width: 100%"
          >
            登 录
          </el-button>
        </el-form-item>
      </el-form>
      <div class="register-link">
        还没有账号？<router-link to="/register">立即注册</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useUserStore } from "@/store/modules/user";
import axios from "axios";
import { ElMessage } from "element-plus";

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

const formRef = ref(null);
const loading = ref(false);

const form = reactive({
  username: "",
  password: "",
  role: "user", // 默认普通用户
});

const rules = {
  username: [
    { required: true, message: "请输入账号或手机号", trigger: "blur" },
  ],
  password: [{ required: true, message: "请输入密码", trigger: "blur" }],
  role: [{ required: true, message: "请选择角色", trigger: "change" }],
};

const handleLogin = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (!valid) return;

    loading.value = true;
    // Login.vue 的 handleLogin 方法中
    try {
      await userStore.login(form.username, form.password, form.role);
      ElMessage.success("登录成功");
      // 根据角色跳转
      router.push(route.query.redirect || getHomePath(form.role));
    } catch (error) {
      ElMessage.error(error.message || "登录失败");
    } finally {
      loading.value = false;
    }
  });
};

function getHomePath(role) {
  const map = {
    admin: "/admin/dashboard",
    vendor: "/vendor/home",
    user: "/markets",
  };
  return map[role] || "/";
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f0f2f5;
}

.login-card {
  width: 400px;
  padding: 40px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #303133;
}

.register-link {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: #909399;
}

.register-link a {
  color: #409eff;
  text-decoration: none;
}
</style>
