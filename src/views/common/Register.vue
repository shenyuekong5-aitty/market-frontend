<template>
  <AuthLayout register>
    <div class="register-card">
      <!-- 品牌区 -->
      <div class="register-brand"><BrandLogo/><h1>开启你的集市日常。</h1><p class="brand-sub">创建账号，发现好物，也让好物被发现。</p></div>

      <el-form :model="form" :rules="rules" ref="formRef" label-width="0">
        <UiFormItem prop="role">
          <div class="register-role-grid" aria-label="选择注册身份">
            <button type="button" :class="{ active: form.role === 'user' }" @click="form.role = 'user'">
              <span>逛集市</span><small>浏览商品、预订与下单</small>
            </button>
            <button type="button" :class="{ active: form.role === 'vendor' }" @click="form.role = 'vendor'">
              <span>经营摊位</span><small>申请摊位并管理商品</small>
            </button>
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
  </AuthLayout>
</template>

<script setup>
import AuthLayout from '@/layout/AuthLayout.vue'
import BrandLogo from '@/components/BrandLogo.vue'
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { register, sendSms } from "@/api/auth";
import { useUserStore } from "@/store/modules/user";

const router = useRouter();
const userStore = useUserStore();
const formRef = ref(null);
const loading = ref(false);
const smsSending = ref(false);
const smsCountdown = ref(60);
const phoneRegistered = ref(false);

const form = reactive({
  phone: "",
  code: "",
  username: "",
  password: "",
  confirmPassword: "",
  nickname: "",
  gender: 1,
  role: "user",
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
  role: [{ required: true, message: "请选择注册身份", trigger: "change" }],
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
      await register(
        {
          phone: form.phone,
          username: form.username,
          password: form.password,
          nickname: form.nickname,
          gender: form.gender,
          role: form.role,
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

<style scoped src="../../styles/auth.css"></style>
