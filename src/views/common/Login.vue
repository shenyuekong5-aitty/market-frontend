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
      <div class="links">
        <el-link
          type="primary"
          underline="never"
          @click="showResetDialog = true"
          >忘记密码？</el-link
        >
        <router-link to="/register">立即注册</router-link>
      </div>
    </div>

    <!-- 忘记密码弹窗 -->
    <el-dialog v-model="showResetDialog" title="重置密码" width="400px" center>
      <el-form
        :model="resetForm"
        :rules="resetRules"
        ref="resetFormRef"
        label-width="80px"
      >
        <el-form-item label="手机号" prop="phone">
          <el-input
            v-model="resetForm.phone"
            placeholder="请输入注册手机号"
            @blur="checkPhoneRegistered"
          />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="resetForm.newPassword"
            type="password"
            placeholder="请输入新密码（需含数字和字母）"
            show-password
          />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="resetForm.confirmPassword"
            type="password"
            placeholder="请再次输入新密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="验证码" prop="code">
          <div style="display: flex; gap: 8px">
            <el-input
              v-model="resetForm.code"
              placeholder="验证码"
              style="flex: 1"
            />
            <el-button
              :disabled="resetSmsSending || !resetForm.phone || !phoneExists"
              @click="sendResetCode"
              style="width: 120px"
            >
              {{ resetButtonText }}
            </el-button>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showResetDialog = false">取消</el-button>
        <el-button
          type="primary"
          :loading="resetLoading"
          @click="handleResetPassword"
          >确认重置</el-button
        >
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, watch, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useUserStore } from "@/store/modules/user";
import { ElMessage } from "element-plus";

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

//  登录表单
const formRef = ref(null);
const loading = ref(false);

const form = reactive({
  username: "",
  password: "",
  role: "user",
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
    try {
      await userStore.login(form.username, form.password, form.role);
      ElMessage.success("登录成功");
      // 角色不同，跳转到的首页不尽相同
      const redirectPath = route.query.redirect || getHomePath(form.role);
      router.push(redirectPath);
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

//  忘记密码
const showResetDialog = ref(false);
const resetFormRef = ref(null);
const resetLoading = ref(false);
const resetSmsSending = ref(false);
const resetCountdown = ref(60);
const phoneExists = ref(false);
const phoneChecking = ref(false);
const codeSent = ref(false);

const resetForm = reactive({
  phone: "",
  newPassword: "",
  confirmPassword: "",
  code: "",
});

const resetButtonText = computed(() => {
  if (resetSmsSending.value) return `${resetCountdown.value}秒`;
  return codeSent.value ? "重新获取验证码" : "获取验证码";
});

// 提示文本
const validateConfirmPassword = (rule, value, callback) => {
  if (value === "") {
    callback(new Error("请再次输入新密码"));
  } else if (value !== resetForm.newPassword) {
    callback(new Error("两次输入的密码不一致"));
  } else {
    callback();
  }
};

const validatePasswordStrength = (rule, value, callback) => {
  if (!value) {
    callback(new Error("请输入新密码"));
  } else if (value.length < 6 || value.length > 18) {
    callback(new Error("密码长度为6-18个字符"));
  } else if (!/^(?=.*[a-zA-Z])(?=.*\d).+$/.test(value)) {
    callback(new Error("密码必须包含数字和字母"));
  } else {
    callback();
  }
};

const resetRules = {
  phone: [
    { required: true, message: "请输入手机号", trigger: "blur" },
    { pattern: /^1[3-9]\d{9}$/, message: "手机号格式不正确", trigger: "blur" },
  ],
  newPassword: [
    { required: true, message: "请输入新密码", trigger: "blur" },
    { validator: validatePasswordStrength, trigger: "blur" },
  ],
  confirmPassword: [
    { required: true, message: "请再次输入新密码", trigger: "blur" },
    { validator: validateConfirmPassword, trigger: "blur" },
  ],
  code: [{ required: true, message: "请输入验证码", trigger: "blur" }],
};

const checkPhoneRegistered = async () => {
  if (!resetForm.phone || !/^1[3-9]\d{9}$/.test(resetForm.phone)) {
    phoneExists.value = false;
    return;
  }
  phoneChecking.value = true;
  try {
    const exists = await userStore.isPhoneRegistered(resetForm.phone);
    phoneExists.value = exists;
    if (!exists) {
      ElMessage.warning("该手机号未注册");
    }
  } catch (error) {
    ElMessage.error("检查手机号失败");
    phoneExists.value = false;
  } finally {
    phoneChecking.value = false;
  }
};

const sendResetCode = async () => {
  if (!resetForm.phone || !/^1[3-9]\d{9}$/.test(resetForm.phone)) {
    ElMessage.warning("请输入正确的手机号");
    return;
  }
  if (!phoneExists.value) {
    ElMessage.warning("该手机号未注册");
    return;
  }
  resetSmsSending.value = true;
  codeSent.value = true;
  let count = 60;
  resetCountdown.value = count;
  const timer = setInterval(() => {
    count--;
    resetCountdown.value = count;
    if (count <= 0) {
      clearInterval(timer);
      resetSmsSending.value = false;
    }
  }, 1000);
  try {
    await userStore.sendResetPasswordCode(resetForm.phone);
    ElMessage.success("验证码已发送");
  } catch (error) {
    ElMessage.error(error.message || "发送失败");
    clearInterval(timer);
    resetSmsSending.value = false;
    codeSent.value = false;
  }
};

const handleResetPassword = async () => {
  if (!resetFormRef.value) return;
  await resetFormRef.value.validate(async (valid) => {
    if (!valid) return;
    resetLoading.value = true;
    try {
      await userStore.resetPasswordByPhone(
        resetForm.phone,
        resetForm.code,
        resetForm.newPassword,
      );
      ElMessage.success("密码重置成功，请使用新密码登录");
      showResetDialog.value = false;
      resetForm.phone = "";
      resetForm.newPassword = "";
      resetForm.confirmPassword = "";
      resetForm.code = "";
      phoneExists.value = false;
      codeSent.value = false;
    } catch (error) {
      ElMessage.error(error.message || "重置失败");
    } finally {
      resetLoading.value = false;
    }
  });
};

watch(showResetDialog, (val) => {
  if (!val) {
    codeSent.value = false;
    phoneExists.value = false;
    resetForm.phone = "";
    resetForm.newPassword = "";
    resetForm.confirmPassword = "";
    resetForm.code = "";
  }
});
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
.links {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}
.links a {
  color: #409eff;
  text-decoration: none;
  font-size: 14px;
}
</style>
