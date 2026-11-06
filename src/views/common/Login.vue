<template>
  <AuthLayout>
    <div class="login-card">
      <div class="login-brand"><BrandLogo/><h1>欢迎回来。</h1><p class="brand-sub">登录账号，继续探索身边的好物。</p></div>

      <el-form :model="form" :rules="rules" ref="formRef" label-width="0">
        <UiFormItem prop="username">
          <UiInput
            v-model="form.username"
            placeholder="账号 / 手机号"
            prefix-icon="User"
            class="login-input"
          />
        </UiFormItem>
        <UiFormItem prop="password">
          <UiInput
            v-model="form.password"
            type="password"
            placeholder="密码"
            prefix-icon="Lock"
            show-password
            class="login-input"
          />
        </UiFormItem>
        <UiFormItem prop="role">
          <UiSelect
            v-model="form.role"
            placeholder="请选择登录角色"
            class="login-select desktop-role-select"
          >
            <UiOption label="超级管理员" value="super_admin" />
            <UiOption label="集市管理员" value="market_admin" />
            <UiOption label="小贩" value="vendor" />
            <UiOption label="普通用户" value="user" />
          </UiSelect>
          <button type="button" class="mobile-role-trigger" aria-haspopup="dialog" @click="roleChooserVisible = true">
            <span><small>登录身份</small><strong>{{ roleOptions.find(item => item.value === form.role)?.label || '请选择身份' }}</strong></span>
            <span class="trigger-chevron" aria-hidden="true">⌄</span>
          </button>
        </UiFormItem>
        <UiFormItem>
          <UiButton
            type="primary"
            :loading="loading"
            @click="handleLogin"
            class="login-btn"
          >
            {{ loading ? "登录中..." : "登 录" }}
          </UiButton>
        </UiFormItem>
      </el-form>

      <div class="links">
        <button
          type="button"
          class="text-link link-item"
          @click="showResetDialog = true"
          >忘记密码？</button
        >
        <router-link to="/register" class="link-item">立即注册</router-link>
      </div>
    </div>

    <!-- 忘记密码弹窗 -->
    <UiDialog
      v-model="showResetDialog"
      title="重置密码"
      width="440px"
      center
      class="reset-dialog"
    >
      <el-form
        :model="resetForm"
        :rules="resetRules"
        ref="resetFormRef"
        label-width="80px"
        class="reset-form"
      >
        <UiFormItem label="手机号" prop="phone">
          <UiInput
            v-model="resetForm.phone"
            placeholder="请输入注册手机号"
            @blur="checkPhoneRegistered"
            class="reset-input"
          />
        </UiFormItem>
        <UiFormItem label="新密码" prop="newPassword">
          <UiInput
            v-model="resetForm.newPassword"
            type="password"
            placeholder="需含数字和字母（6-18位）"
            show-password
            class="reset-input"
          />
        </UiFormItem>
        <UiFormItem label="确认密码" prop="confirmPassword">
          <UiInput
            v-model="resetForm.confirmPassword"
            type="password"
            placeholder="请再次输入新密码"
            show-password
            class="reset-input"
          />
        </UiFormItem>
        <UiFormItem label="验证码" prop="code">
          <div class="code-row">
            <UiInput
              v-model="resetForm.code"
              placeholder="验证码"
              class="reset-input code-input"
            />
            <UiButton
              :disabled="resetSmsSending || !resetForm.phone || !phoneExists"
              @click="sendResetCode"
              class="code-btn"
            >
              {{ resetButtonText }}
            </UiButton>
          </div>
        </UiFormItem>
      </el-form>
      <template #footer>
        <UiButton @click="showResetDialog = false" class="dialog-btn">取消</UiButton>
        <UiButton
          type="primary"
          :loading="resetLoading"
          @click="handleResetPassword"
          class="dialog-btn dialog-btn-primary"
        >
          确认重置
        </UiButton>
      </template>
    </UiDialog>
    <UiDialog v-model="roleChooserVisible" title="选择登录身份" width="400px" class="role-chooser-dialog">
      <p class="role-chooser-intro">选择你在智慧集市中的身份，登录后进入对应空间。</p>
      <div class="role-options">
        <button v-for="item in roleOptions" :key="item.value" type="button" class="role-option" :class="{ 'is-selected': form.role === item.value }" @click="form.role = item.value; roleChooserVisible = false">
          <span class="role-option-mark">{{ item.mark }}</span>
          <span><strong>{{ item.label }}</strong><small>{{ item.description }}</small></span>
          <span class="role-check" aria-hidden="true">{{ form.role === item.value ? '✓' : '' }}</span>
        </button>
      </div>
    </UiDialog>
  </AuthLayout>
</template>

<script setup>
import AuthLayout from '@/layout/AuthLayout.vue'
import BrandLogo from '@/components/BrandLogo.vue'
import { ref, reactive, watch, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useUserStore } from "@/store/modules/user";
import { ElMessage } from "element-plus";
import { homePathForRole } from '@/utils/roles'

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const roleChooserVisible = ref(false);
const roleOptions = [
  { value: 'user', label: '普通用户', description: '逛集市，发现和购买好物', mark: '逛' },
  { value: 'vendor', label: '小贩', description: '经营摊位，打理我的小店', mark: '店' },
  { value: 'market_admin', label: '集市管理员', description: '管理所属集市与摊位', mark: '管' },
  { value: 'super_admin', label: '超级管理员', description: '负责全平台管理', mark: '总' },
];

const formRef = ref(null);
const loading = ref(false);

const form = reactive({
  username: "",
  password: "",
  role: "user",
});

watch(() => route.query.role, (role) => {
  if (typeof role === 'string' && roleOptions.some(option => option.value === role)) {
    form.role = role;
  }
}, { immediate: true });

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
  return homePathForRole(role);
}

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
  return codeSent.value ? "重新获取" : "获取验证码";
});

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

<style scoped src="../../styles/auth.css"></style>
