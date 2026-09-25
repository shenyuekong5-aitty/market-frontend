<template>
  <UiDialog
    v-model="visible"
    title="修改密码"
    width="450px"
    @close="resetForm"
  >
    <el-form
      :model="form"
      ref="formRef"
      :rules="rules"
      label-width="100px"
      label-position="right"
      style="padding: 20px 20px 0 0"
    >
      <UiFormItem label="旧密码" prop="password">
        <UiInput
          v-model="form.password"
          placeholder="请输入原登录密码"
          show-password
        />
      </UiFormItem>

      <UiFormItem label="新密码" prop="newPassword">
        <UiInput
          v-model="form.newPassword"
          placeholder="6-18位，需包含数字和字母"
          show-password
        />
      </UiFormItem>

      <UiFormItem label="确认密码" prop="confirmPassword">
        <UiInput
          v-model="form.confirmPassword"
          placeholder="请再次输入新密码"
          show-password
          @keyup.enter="submit"
        />
      </UiFormItem>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <UiButton @click="visible = false">取消</UiButton>
        <UiButton type="primary" :loading="loading" @click="submit"
          >确认修改</UiButton
        >
      </span>
    </template>
  </UiDialog>
</template>

<script setup>
import { ref, reactive } from "vue";
import { ElMessage } from "element-plus";
import { useUserStore } from "@/store/modules/user";
import { useRouter } from "vue-router";

const userStore = useUserStore();
const router = useRouter();
const visible = ref(false);
const loading = ref(false);
const formRef = ref(null);

const form = reactive({
  password: "",
  newPassword: "",
  confirmPassword: "",
});

const validateNewPwd = (_rule, value, callback) => {
  if (!value) {
    callback(new Error("请输入新密码"));
  } else if (value.length < 6 || value.length > 18) {
    callback(new Error("密码长度为6-18个字符"));
  } else if (!/^(?=.*[a-zA-Z])(?=.*\d).+$/.test(value)) {
    callback(new Error("密码必须包含数字和字母"));
  } else if (value === form.password) {
    callback(new Error("新密码不能与原密码相同！"));
  } else {
    callback();
  }
};

const validateConfirmPwd = (_rule, value, callback) => {
  if (value !== form.newPassword) {
    callback(new Error("两次输入的密码不一致！"));
  } else {
    callback();
  }
};

const rules = {
  password: [{ required: true, message: "请输入原密码", trigger: "blur" }],
  newPassword: [
    { required: true, message: "请输入新密码", trigger: "blur" },
    { validator: validateNewPwd, trigger: "blur" },
  ],
  confirmPassword: [
    { required: true, message: "请再次输入新密码", trigger: "blur" },
    { validator: validateConfirmPwd, trigger: "blur" },
  ],
};

const resetForm = () => {
  formRef.value?.resetFields();
};

const submit = async () => {
  try {
    await formRef.value.validate();
  } catch (e) {
    ElMessage.warning("请检查输入项");
    console.log("校验失败详情：", e);
    return;
  }

  loading.value = true;
  try {
    await userStore.changePassword(form.password, form.newPassword);
    ElMessage.success("密码修改成功，请重新登录");
    visible.value = false;
    userStore.logout();
    router.push("/login");
  } catch (error) {
    // 错误提示已在 request.js 拦截器中统一处理，此处无需重复弹窗
  } finally {
    loading.value = false;
  }
};

defineExpose({
  open: () => {
    visible.value = true;
  },
});
</script>
