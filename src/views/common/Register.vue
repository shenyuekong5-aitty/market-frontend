<template>
  <div class="register-container">
    <div class="register-card">
      <h2>注册新账号</h2>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="0">
        <!-- 头像上传（可选） -->
        <el-form-item>
          <span class="upload-tip">点击上传头像（可选）</span>
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
        </el-form-item>

        <!-- 手机号 -->
        <el-form-item prop="phone">
          <el-input
            v-model="form.phone"
            placeholder="手机号"
            @blur="checkPhoneRegistered"
          />
        </el-form-item>

        <!-- 验证码 -->
        <el-form-item prop="code">
          <div style="display: flex; gap: 8px">
            <el-input
              v-model="form.code"
              placeholder="验证码"
              style="flex: 1"
            />
            <el-button
              :disabled="smsSending || !form.phone || phoneRegistered"
              @click="sendCode"
              style="width: 120px"
            >
              {{ smsSending ? smsCountdown + "秒" : "获取验证码" }}
            </el-button>
          </div>
        </el-form-item>

        <!-- 账号 -->
        <el-form-item prop="username">
          <el-input v-model="form.username" placeholder="账号" />
        </el-form-item>

        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="密码（6-18位，需包含数字和字母）"
            show-password
          />
        </el-form-item>

        <!-- 确认密码 -->
        <el-form-item prop="confirmPassword">
          <el-input
            v-model="form.confirmPassword"
            type="password"
            placeholder="确认密码"
            show-password
          />
        </el-form-item>

        <!-- 昵称 -->
        <el-form-item prop="nickname">
          <el-input v-model="form.nickname" placeholder="昵称" />
        </el-form-item>

        <!-- 性别 -->
        <el-form-item>
          <el-radio-group v-model="form.gender">
            <el-radio :label="1">男</el-radio>
            <el-radio :label="0">女</el-radio>
            <el-radio :label="2">保密</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            :loading="loading"
            @click="handleRegister"
            style="width: 100%"
          >
            注 册
          </el-button>
        </el-form-item>
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
const pendingAvatarFile = ref(null); // 暂存选择的头像文件

const form = reactive({
  phone: "",
  code: "",
  username: "",
  password: "",
  confirmPassword: "",
  nickname: "",
  gender: 1,
  avatarPreview: "", // 本地预览URL
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
      // 上传头像（如果有）
      let avatarPath = "";
      if (pendingAvatarFile.value) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", pendingAvatarFile.value);
        const uploadRes = await uploadAvatar(uploadFormData);
        avatarPath = uploadRes.data;
      }
      // 注册请求
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
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f0f2f5;
}
.register-card {
  width: 420px;
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
.login-link {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: #909399;
}
.login-link a {
  color: #409eff;
  text-decoration: none;
}

/* 头像上传样式优化 */
.avatar-upload {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  margin: 0 auto;
  overflow: hidden;
  cursor: pointer;
  border: 2px dashed #dcdfe6;
  border-radius: 50%;
}

.avatar-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.avatar-placeholder-icon {
  font-size: 30px;
  color: #c0c4cc;
}

.upload-tip {
  display: block;
  margin-top: 6px;
  font-size: 12px;
  color: #999;
  text-align: center;
}
</style>
