<template>
  <div class="login-container">
    <!-- 背景装饰 -->
    <div class="bg-decoration">
      <div class="bg-ornament bg-ornament-1"></div>
      <div class="bg-ornament bg-ornament-2"></div>
    </div>

    <div class="login-card">
      <div class="login-brand">
        <span class="brand-mark">
          <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
            <path d="M4 32L24 10L44 32" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M24 10L24 38" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
            <path d="M14 32L34 32" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
            <rect x="18" y="26" width="12" height="6" rx="1" stroke="currentColor" stroke-width="2"/>
            <circle cx="21" cy="29" r="1" fill="currentColor"/>
            <circle cx="27" cy="29" r="1" fill="currentColor"/>
          </svg>
        </span>
        <h2>智慧集市</h2>
        <p class="brand-sub">欢迎回来</p>
      </div>

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
            class="login-select"
          >
            <UiOption label="管理员" value="admin" />
            <UiOption label="小贩" value="vendor" />
            <UiOption label="普通用户" value="user" />
          </UiSelect>
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

<style scoped>
/* ============================================================
   1. 设计 Token
   ============================================================ */
.login-container {
  --text: var(--ink-strong);
  --text-secondary: var(--ink);
  --text-muted: var(--ink-muted);
  --accent: var(--brand-primary);
  --accent-light: var(--brand-primary-soft);
  --shadow: var(--shadow-md);
  --radius: var(--radius-lg);

  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100dvh;
  background: var(--surface-page);
  padding: 20px;
  position: relative;
  overflow: hidden;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

/* ============================================================
   2. 背景装饰
   ============================================================ */
.bg-decoration {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.bg-ornament {
  position: absolute;
  border-radius: 50%;
  background: rgba(201, 125, 74, 0.04);
}

.bg-ornament-1 {
  width: 500px;
  height: 500px;
  top: -150px;
  right: -100px;
}

.bg-ornament-2 {
  width: 400px;
  height: 400px;
  bottom: -150px;
  left: -100px;
  background: rgba(201, 125, 74, 0.03);
}

/* ============================================================
   3. 登录卡片
   ============================================================ */
.login-card {
  position: relative;
  z-index: 1;
  width: 400px;
  max-width: 100%;
  padding: 48px 40px 36px;
  background: #ffffff;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  transition: transform 0.3s ease;
}

/* 品牌区 */
.login-brand {
  text-align: center;
  margin-bottom: 32px;
}

.brand-mark {
  display: inline-block;
  font-size: 2rem;
  color: var(--accent);
  margin-bottom: 4px;
}

.login-brand h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 4px 0;
  letter-spacing: 0.04em;
}

.brand-sub {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin: 0;
}

/* ============================================================
   4. 表单控件
   ============================================================ */
.login-input :deep(.el-input__wrapper) {
  border-radius: 100px;
  box-shadow: none !important;
  border: 1px solid var(--line);
  padding: 0 18px;
  height: 46px;
  transition: border-color 0.25s;
}

.login-input :deep(.el-input__wrapper.is-focus) {
  border-color: var(--accent);
}

.login-input :deep(.el-input__inner) {
  color: var(--text);
  font-size: 0.9rem;
}

.login-input :deep(.el-input__prefix) {
  color: var(--text-muted);
  margin-right: 8px;
}

.login-select :deep(.el-input__wrapper) {
  border-radius: 100px;
  box-shadow: none !important;
  border: 1px solid var(--line);
  padding: 0 18px;
  height: 46px;
  transition: border-color 0.25s;
}

.login-select :deep(.el-input__wrapper.is-focus) {
  border-color: var(--accent);
}

.login-select :deep(.el-select__caret) {
  color: var(--text-muted);
}

:deep(.el-select-dropdown) {
  border-radius: 12px;
  border: none;
  box-shadow: var(--shadow);
}

:deep(.el-select-dropdown .el-select-dropdown__item) {
  color: var(--text);
}

:deep(.el-select-dropdown .el-select-dropdown__item.is-selected) {
  background: var(--accent-light);
  color: var(--accent);
}

:deep(.el-select-dropdown .el-select-dropdown__item:hover) {
  background: var(--accent-light);
}

/* ============================================================
   5. 登录按钮
   ============================================================ */
.login-btn {
  width: 100%;
  height: 46px;
  border-radius: 100px;
  background: var(--text);
  border: none;
  font-weight: 600;
  font-size: 1rem;
  color: #fff;
  transition: background 0.25s, transform 0.2s;
  margin-top: 4px;
}

.login-btn:hover {
  background: var(--accent);
}

.login-btn:active {
  transform: scale(0.98);
}

.login-btn.is-loading {
  background: var(--text);
}

:deep(.login-btn .el-loading-spinner) {
  color: #fff;
}

/* ============================================================
   6. 底部链接
   ============================================================ */
.links {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 18px;
}

.link-item {
  font-size: 0.85rem;
  color: var(--text-secondary);
  text-decoration: none;
  transition: color 0.2s;
  cursor: pointer;
}

.link-item:hover {
  color: var(--accent);
}

.links .link-item:last-child {
  color: var(--text-secondary);
}

.links .link-item:last-child:hover {
  color: var(--accent);
}

/* ============================================================
   7. 重置密码弹窗
   ============================================================ */
.reset-dialog :deep(.el-dialog) {
  border-radius: var(--radius);
  box-shadow: var(--shadow);
}

.reset-dialog :deep(.el-dialog__header) {
  border-bottom: 1px solid var(--line);
  padding: 20px 24px;
  background: var(--surface-card);
}

.reset-dialog :deep(.el-dialog__title) {
  color: var(--text);
  font-weight: 600;
  font-size: 1.1rem;
}

.reset-dialog :deep(.el-dialog__body) {
  padding: 24px;
}

.reset-dialog :deep(.el-dialog__footer) {
  border-top: 1px solid var(--line);
  padding: 16px 24px;
  background: var(--surface-card);
  border-radius: 0 0 var(--radius) var(--radius);
}

.reset-form :deep(.el-form-item__label) {
  color: var(--text-secondary);
  font-weight: 500;
  font-size: 0.85rem;
}

.reset-input :deep(.el-input__wrapper) {
  border-radius: 100px;
  box-shadow: none !important;
  border: 1px solid var(--line);
  padding: 0 16px;
  height: 42px;
  transition: border-color 0.25s;
}

.reset-input :deep(.el-input__wrapper.is-focus) {
  border-color: var(--accent);
}

.reset-input :deep(.el-input__inner) {
  color: var(--text);
}

.code-row {
  display: flex;
  gap: 10px;
  width: 100%;
}

.code-input {
  flex: 1;
}

.code-btn {
  border-radius: 100px;
  background: transparent;
  border: 1px solid var(--line);
  color: var(--text-secondary);
  font-weight: 500;
  padding: 0 16px;
  height: 42px;
  transition: all 0.25s;
  flex-shrink: 0;
  cursor: pointer;
}

.code-btn:hover:not(:disabled) {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-light);
}

.code-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.dialog-btn {
  border-radius: 100px;
  padding: 8px 24px;
  font-weight: 500;
  border: 1px solid var(--line);
  background: transparent;
  color: var(--text-secondary);
  transition: all 0.25s;
}

.dialog-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-light);
}

.dialog-btn-primary {
  background: var(--text);
  border: none;
  color: #fff;
}

.dialog-btn-primary:hover {
  background: var(--accent);
  color: #fff;
}

/* ============================================================
   8. 响应式适配
   ============================================================ */

/* ---- 移动端（< 768px） ---- */
@media (max-width: 767px) {
  .login-container {
    padding: 16px;
    align-items: center;
    min-height: 100dvh;
  }

  .bg-ornament-1 {
    width: 300px;
    height: 300px;
    top: -80px;
    right: -60px;
  }

  .bg-ornament-2 {
    width: 250px;
    height: 250px;
    bottom: -80px;
    left: -60px;
  }

  .login-card {
    padding: 32px 20px 28px;
    border-radius: 20px;
    margin: auto 0;
  }

  .login-brand h2 {
    font-size: 1.3rem;
  }

  .brand-mark {
    font-size: 1.6rem;
  }

  .login-input :deep(.el-input__wrapper) {
    height: 44px;
  }

  .login-select :deep(.el-input__wrapper) {
    height: 44px;
  }

  .login-btn {
    height: 44px;
    font-size: 0.95rem;
  }

  .links {
    font-size: 0.8rem;
  }

  .reset-dialog :deep(.el-dialog) {
    width: 95% !important;
    margin: 10px auto !important;
  }

  .reset-dialog :deep(.el-dialog__header) {
    padding: 14px 16px;
  }

  .reset-dialog :deep(.el-dialog__body) {
    padding: 16px;
  }

  .reset-dialog :deep(.el-dialog__footer) {
    padding: 12px 16px;
  }

  .reset-form :deep(.el-form-item) {
    margin-bottom: 16px;
  }

  .reset-form :deep(.el-form-item__label) {
    font-size: 0.8rem;
    padding-bottom: 4px;
  }

  .reset-input :deep(.el-input__wrapper) {
    height: 40px;
  }

  .code-btn {
    height: 40px;
    font-size: 0.75rem;
    padding: 0 12px;
    min-width: 80px;
  }

  .dialog-btn {
    padding: 6px 16px;
    font-size: 0.85rem;
  }
}

/* ---- 平板端（768px ~ 1024px） 修复卡片靠下问题 ---- */
@media (min-width: 768px) and (max-width: 1024px) {
  .login-container {
    min-height: 100dvh;
    padding: 20px;
    align-items: center;
  }

  .login-card {
    padding: 40px 36px 32px;
    /* 核心修正：上移卡片 */
    margin-top: -5vh;
  }

  .bg-ornament-1 {
    width: 350px;
    height: 350px;
    top: -100px;
    right: -80px;
  }

  .bg-ornament-2 {
    width: 280px;
    height: 280px;
    bottom: -100px;
    left: -80px;
  }

  .login-brand {
    margin-bottom: 28px;
  }

  .login-brand h2 {
    font-size: 1.4rem;
  }

  .login-input :deep(.el-input__wrapper) {
    height: 44px;
  }

  .login-select :deep(.el-input__wrapper) {
    height: 44px;
  }

  .login-btn {
    height: 44px;
  }
}

/* ---- 针对小屏平板（768px ~ 820px 竖屏）额外优化 ---- */
@media (min-width: 768px) and (max-width: 820px) and (orientation: portrait) {
  .login-card {
    padding: 32px 28px 28px;
    margin-top: -8vh; /* 进一步上移 */
  }

  .login-brand {
    margin-bottom: 24px;
  }

  .login-brand h2 {
    font-size: 1.25rem;
  }

  .brand-mark {
    font-size: 1.6rem;
  }

  .login-input :deep(.el-input__wrapper),
  .login-select :deep(.el-input__wrapper) {
    height: 40px;
  }

  .login-btn {
    height: 40px;
    font-size: 0.9rem;
  }
}

/* ---- 大屏平板横屏（1024px ~ 1366px）微调 ---- */
@media (min-width: 1025px) and (max-width: 1366px) and (orientation: landscape) {
  .login-card {
    margin-top: -3vh;
  }

  .bg-ornament-1 {
    width: 400px;
    height: 400px;
    top: -120px;
    right: -80px;
  }

  .bg-ornament-2 {
    width: 320px;
    height: 320px;
    bottom: -120px;
    left: -80px;
  }
}

/* ---- 桌面端（≥ 1025px，非平板横屏） ---- */
@media (min-width: 1025px) {
  .login-card {
    padding: 52px 44px 40px;
    margin-top: 0; /* 重置偏移 */
  }
}
</style>
