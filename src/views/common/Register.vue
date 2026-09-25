<template>
  <div class="register-container">
    <!-- 背景装饰 -->
    <div class="bg-decoration">
      <div class="bg-ornament bg-ornament-1"></div>
      <div class="bg-ornament bg-ornament-2"></div>
    </div>

    <div class="register-card">
      <!-- 品牌区 -->
      <div class="register-brand">
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
        <p class="brand-sub">创建新账号</p>
      </div>

      <el-form :model="form" :rules="rules" ref="formRef" label-width="0">
        <!-- 头像上传 -->
        <UiFormItem>
          <div class="avatar-section">
            <div class="avatar-upload" @click="triggerFileInput">
              <input
                type="file"
                ref="fileInputRef"
                accept="image/*"
                style="display: none"
                @change="handleAvatarChange"
              />
              <img
                v-if="form.avatarPreview"
                :src="form.avatarPreview"
                class="avatar-preview"
              />
              <el-icon v-else class="avatar-placeholder-icon"><Plus /></el-icon>
            </div>
            <span class="upload-tip">点击上传头像（可选）</span>
          </div>
        </UiFormItem>

        <!-- 手机号 -->
        <UiFormItem prop="phone">
          <UiInput
            v-model="form.phone"
            placeholder="手机号"
            @blur="checkPhoneRegistered"
            class="register-input"
          />
        </UiFormItem>

        <!-- 验证码 -->
        <UiFormItem prop="code">
          <div class="code-row">
            <UiInput
              v-model="form.code"
              placeholder="验证码"
              class="register-input code-input"
            />
            <UiButton
              :disabled="smsSending || !form.phone || phoneRegistered"
              @click="sendCode"
              class="code-btn"
            >
              {{ smsSending ? smsCountdown + "秒" : "获取验证码" }}
            </UiButton>
          </div>
        </UiFormItem>

        <!-- 账号 -->
        <UiFormItem prop="username">
          <UiInput
            v-model="form.username"
            placeholder="账号"
            class="register-input"
          />
        </UiFormItem>

        <!-- 密码 -->
        <UiFormItem prop="password">
          <UiInput
            v-model="form.password"
            type="password"
            placeholder="密码（6-18位，需含数字和字母）"
            show-password
            class="register-input"
          />
        </UiFormItem>

        <!-- 确认密码 -->
        <UiFormItem prop="confirmPassword">
          <UiInput
            v-model="form.confirmPassword"
            type="password"
            placeholder="确认密码"
            show-password
            class="register-input"
          />
        </UiFormItem>

        <!-- 昵称 -->
        <UiFormItem prop="nickname">
          <UiInput
            v-model="form.nickname"
            placeholder="昵称"
            class="register-input"
          />
        </UiFormItem>

        <!-- 性别 -->
        <UiFormItem>
          <UiRadioGroup v-model="form.gender" class="gender-group">
            <UiRadio :label="1" class="gender-radio">男</UiRadio>
            <UiRadio :label="0" class="gender-radio">女</UiRadio>
            <UiRadio :label="2" class="gender-radio">保密</UiRadio>
          </UiRadioGroup>
        </UiFormItem>

        <UiFormItem>
          <UiButton
            type="primary"
            :loading="loading"
            @click="handleRegister"
            class="register-btn"
          >
            {{ loading ? "注册中..." : "注 册" }}
          </UiButton>
        </UiFormItem>
      </el-form>

      <div class="login-link">
        已有账号？<router-link to="/login">立即登录</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { Plus } from "@element-plus/icons-vue";
import { register, sendSms } from "@/api/auth";
import { uploadAvatar } from "@/api/user";
import { useUserStore } from "@/store/modules/user";

const router = useRouter();
const userStore = useUserStore();
const formRef = ref(null);
const fileInputRef = ref(null);
const loading = ref(false);
const smsSending = ref(false);
const smsCountdown = ref(60);
const phoneRegistered = ref(false);
const pendingAvatarFile = ref(null);

const form = reactive({
  phone: "",
  code: "",
  username: "",
  password: "",
  confirmPassword: "",
  nickname: "",
  gender: 1,
  avatarPreview: "",
});

// 自定义校验：确认密码
const validateConfirmPassword = (rule, value, callback) => {
  if (value === "") {
    callback(new Error("请再次输入密码"));
  } else if (value !== form.password) {
    callback(new Error("两次输入的密码不一致"));
  } else {
    callback();
  }
};

const rules = {
  phone: [
    { required: true, message: "请输入手机号", trigger: "blur" },
    { pattern: /^1[3-9]\d{9}$/, message: "手机号格式不正确", trigger: "blur" },
  ],
  code: [{ required: true, message: "请输入验证码", trigger: "blur" }],
  username: [{ required: true, message: "请输入账号", trigger: "blur" }],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 6, max: 18, message: "密码长度为6-18个字符", trigger: "blur" },
    {
      pattern: /^(?=.*[a-zA-Z])(?=.*\d).+$/,
      message: "密码必须包含数字和字母",
      trigger: "blur",
    },
  ],
  confirmPassword: [
    { required: true, message: "请再次输入密码", trigger: "blur" },
    { validator: validateConfirmPassword, trigger: "blur" },
  ],
  nickname: [{ required: true, message: "请输入昵称", trigger: "blur" }],
};

// 手机号失焦检查是否已注册
const checkPhoneRegistered = async () => {
  if (!form.phone || !/^1[3-9]\d{9}$/.test(form.phone)) {
    phoneRegistered.value = false;
    return;
  }
  try {
    const exists = await userStore.isPhoneRegistered(form.phone);
    phoneRegistered.value = exists;
    if (exists) {
      ElMessage.warning("该手机号已注册，请直接登录或使用其他手机号");
    }
  } catch (error) {
    ElMessage.error("检查手机号失败");
    phoneRegistered.value = false;
  }
};

// 发送验证码
const sendCode = async () => {
  if (!form.phone || !/^1[3-9]\d{9}$/.test(form.phone)) {
    ElMessage.warning("请输入正确的手机号");
    return;
  }
  if (phoneRegistered.value) {
    ElMessage.warning("该手机号已注册");
    return;
  }
  smsSending.value = true;
  let count = 60;
  smsCountdown.value = count;
  const timer = setInterval(() => {
    count--;
    smsCountdown.value = count;
    if (count <= 0) {
      clearInterval(timer);
      smsSending.value = false;
    }
  }, 1000);
  try {
    await sendSms(form.phone);
    ElMessage.success("验证码已发送");
  } catch (error) {
    ElMessage.error("发送失败");
    clearInterval(timer);
    smsSending.value = false;
  }
};

// 触发文件选择
const triggerFileInput = () => {
  fileInputRef.value?.click();
};

// 头像文件处理
const handleAvatarChange = (event) => {
  const input = event.target;
  const file = input.files?.[0];
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    ElMessage.warning("请选择图片文件");
    input.value = "";
    return;
  }
  if (file.size > 500 * 1024) {
    ElMessage.warning("头像大小不能超过500KB");
    input.value = "";
    return;
  }
  pendingAvatarFile.value = file;
  const reader = new FileReader();
  reader.onload = (e) => {
    form.avatarPreview = e.target.result;
  };
  reader.readAsDataURL(file);
  input.value = "";
};

// 注册
const handleRegister = async () => {
  if (!formRef.value) return;
  if (phoneRegistered.value) {
    ElMessage.warning("该手机号已注册");
    return;
  }
  await formRef.value.validate(async (valid) => {
    if (!valid) return;
    loading.value = true;
    try {
      let avatarPath = "";
      if (pendingAvatarFile.value) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", pendingAvatarFile.value);
        const uploadRes = await uploadAvatar(uploadFormData);
        avatarPath = uploadRes.data;
      }
      await register(
        {
          phone: form.phone,
          username: form.username,
          password: form.password,
          nickname: form.nickname,
          gender: form.gender,
          avatar: avatarPath,
        },
        form.code,
      );
      ElMessage.success("注册成功，即将跳转到登录页");
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (error) {
      ElMessage.error(error.message || "注册失败");
    } finally {
      loading.value = false;
    }
  });
};
</script>

<style scoped>
/* ============================================================
   1. 设计 Token
   ============================================================ */
.register-container {
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
   3. 注册卡片
   ============================================================ */
.register-card {
  position: relative;
  z-index: 1;
  width: 440px;
  max-width: 100%;
  padding: 44px 40px 32px;
  background: #ffffff;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  transition: transform 0.3s ease;
}

/* 品牌区 */
.register-brand {
  text-align: center;
  margin-bottom: 28px;
}

.brand-mark {
  display: inline-block;
  font-size: 2rem;
  color: var(--accent);
  margin-bottom: 4px;
}

.register-brand h2 {
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
   4. 头像上传
   ============================================================ */
.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
}

.avatar-upload {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  overflow: hidden;
  cursor: pointer;
  border: 2px dashed var(--line);
  border-radius: 50%;
  transition: border-color 0.3s, background 0.3s;
  background: var(--surface-page);
  flex-shrink: 0;
}

.avatar-upload:hover {
  border-color: var(--accent);
  background: var(--accent-light);
}

.avatar-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.avatar-placeholder-icon {
  font-size: 30px;
  color: var(--text-muted);
}

.upload-tip {
  font-size: 12px;
  color: var(--text-muted);
}

/* ============================================================
   5. 表单控件
   ============================================================ */
.register-input :deep(.el-input__wrapper) {
  border-radius: 100px;
  box-shadow: none !important;
  border: 1px solid var(--line);
  padding: 0 18px;
  height: 46px;
  transition: border-color 0.25s;
}

.register-input :deep(.el-input__wrapper.is-focus) {
  border-color: var(--accent);
}

.register-input :deep(.el-input__inner) {
  color: var(--text);
  font-size: 0.9rem;
}

.register-input :deep(.el-input__inner::placeholder) {
  color: var(--text-muted);
}

.register-input :deep(.el-input__prefix) {
  color: var(--text-muted);
  margin-right: 8px;
}

/* ============================================================
   6. 验证码行
   ============================================================ */
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
  height: 46px;
  transition: all 0.25s;
  flex-shrink: 0;
  cursor: pointer;
  font-size: 0.85rem;
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

/* ============================================================
   7. 性别选择
   ============================================================ */
.gender-group {
  display: flex;
  gap: 20px;
  padding: 4px 0;
}

.gender-radio :deep(.el-radio__label) {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.gender-radio :deep(.el-radio__input.is-checked .el-radio__inner) {
  border-color: var(--accent);
  background: var(--accent);
}

.gender-radio :deep(.el-radio__input.is-checked + .el-radio__label) {
  color: var(--text);
}

.gender-radio :deep(.el-radio__inner) {
  border-color: var(--line);
}

/* ============================================================
   8. 注册按钮
   ============================================================ */
.register-btn {
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

.register-btn:hover {
  background: var(--accent);
}

.register-btn:active {
  transform: scale(0.98);
}

.register-btn.is-loading {
  background: var(--text);
}

:deep(.register-btn .el-loading-spinner) {
  color: #fff;
}

/* ============================================================
   9. 底部链接
   ============================================================ */
.login-link {
  text-align: center;
  margin-top: 20px;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.login-link a {
  color: var(--accent);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.login-link a:hover {
  color: var(--text);
}

/* ============================================================
   10. 响应式适配
   ============================================================ */

/* ---- 移动端（< 768px） ---- */
@media (max-width: 767px) {
  .register-container {
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

  .register-card {
    padding: 28px 18px 24px;
    border-radius: 20px;
    margin: auto 0;
  }

  .register-brand h2 {
    font-size: 1.3rem;
  }

  .brand-mark {
    font-size: 1.6rem;
  }

  .register-brand {
    margin-bottom: 22px;
  }

  .register-input :deep(.el-input__wrapper) {
    height: 44px;
  }

  .code-btn {
    height: 44px;
    font-size: 0.75rem;
    padding: 0 12px;
    min-width: 80px;
  }

  .register-btn {
    height: 44px;
    font-size: 0.95rem;
  }

  .avatar-upload {
    width: 72px;
    height: 72px;
  }

  .avatar-placeholder-icon {
    font-size: 26px;
  }

  .gender-group {
    gap: 14px;
    flex-wrap: wrap;
  }

  .login-link {
    font-size: 0.8rem;
  }
}

/* ---- 平板端（768px ~ 1024px） 修复卡片靠下问题 ---- */
@media (min-width: 768px) and (max-width: 1024px) {
  .register-container {
    min-height: 100dvh;
    padding: 20px;
    align-items: center;
  }

  .register-card {
    padding: 36px 32px 28px;
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

  .register-brand {
    margin-bottom: 24px;
  }

  .register-brand h2 {
    font-size: 1.4rem;
  }

  .register-input :deep(.el-input__wrapper) {
    height: 44px;
  }

  .code-btn {
    height: 44px;
  }

  .register-btn {
    height: 44px;
  }
}

/* ---- 小屏平板竖屏（768px ~ 820px）额外优化 ---- */
@media (min-width: 768px) and (max-width: 820px) and (orientation: portrait) {
  .register-card {
    padding: 28px 24px 24px;
    margin-top: -8vh;
  }

  .register-brand {
    margin-bottom: 20px;
  }

  .register-brand h2 {
    font-size: 1.25rem;
  }

  .brand-mark {
    font-size: 1.6rem;
  }

  .register-input :deep(.el-input__wrapper) {
    height: 40px;
  }

  .code-btn {
    height: 40px;
    font-size: 0.75rem;
  }

  .register-btn {
    height: 40px;
    font-size: 0.9rem;
  }

  .avatar-upload {
    width: 64px;
    height: 64px;
  }

  .avatar-placeholder-icon {
    font-size: 22px;
  }
}

/* ---- 大屏平板横屏（1024px ~ 1366px）微调 ---- */
@media (min-width: 1025px) and (max-width: 1366px) and (orientation: landscape) {
  .register-card {
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

/* ---- 桌面端（≥ 1025px） ---- */
@media (min-width: 1025px) {
  .register-card {
    padding: 48px 44px 36px;
    margin-top: 0;
  }
}
</style>
