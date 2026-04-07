<template>
  <div class="login-page">
    <div class="login-card">

      <!-- 英文輔助標籤 + 標題 -->
      <div class="title-block">
        <span class="eyebrow">B2B ORDER SYSTEM</span>
        <h1 class="system-title">訂單管理系統</h1>
        <p class="system-sub">請登入您的帳號繼續操作</p>
      </div>

      <form @submit.prevent="submitLogin" class="login-form">
        <div class="field-group">
          <label class="field-label">帳號</label>
          <div class="input-wrapper">
            <user-icon :size="15" :stroke-width="1.5" class="input-icon" />
            <input
              v-model.trim="username"
              class="v-input icon-input"
              type="text"
              autocomplete="username"
              placeholder="請輸入帳號"
            />
          </div>
        </div>
        <div class="field-group">
          <label class="field-label">密碼</label>
          <div class="input-wrapper">
            <lock-icon :size="15" :stroke-width="1.5" class="input-icon" />
            <input
              v-model="password"
              class="v-input icon-input"
              type="password"
              autocomplete="current-password"
              placeholder="請輸入密碼"
            />
          </div>
        </div>
        <button class="v-btn login-btn" type="submit">
          <log-in-icon :size="16" :stroke-width="1.5" />
          登入
        </button>
      </form>

      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

      <div class="quick-login">
        <p class="quick-label">
          <span class="quick-line"></span>
          <span class="quick-text">展示快速登入</span>
          <span class="quick-line"></span>
        </p>
        <div class="quick-buttons">
          <div class="quick-btn-wrap">
            <button type="button" class="quick-button" @click="quickLogin('customer')">客戶</button>
            <span class="quick-hint">可體驗下單流程</span>
          </div>
          <div class="quick-btn-wrap">
            <button type="button" class="quick-button" @click="quickLogin('sales')">銷售人員</button>
            <span class="quick-hint">可體驗審單、盤點、市場活動</span>
          </div>
          <div class="quick-btn-wrap">
            <button type="button" class="quick-button" @click="quickLogin('company_admin')">公司管理員</button>
            <span class="quick-hint">可查看訂單列表</span>
          </div>
          <div class="quick-btn-wrap">
            <button type="button" class="quick-button" @click="quickLogin('group_admin')">群管理員</button>
            <span class="quick-hint">可查看跨公司訂單</span>
          </div>
        </div>
      </div>
      <p class="demo-note">展示版本 — 所有資料均為模擬資料</p>
    </div>
  </div>
</template>

<script>
import { users } from '../mock/users'
import { getCurrentUser } from '../services/auth'
import {
  User as UserIcon,
  Lock as LockIcon,
  LogIn as LogInIcon
} from 'lucide-vue'

const roleRedirectMap = {
  customer: '/products',
  sales: '/',
  company_admin: '/orders',
  group_admin: '/orders'
}

export default {
  name: 'LoginPage',
  components: { UserIcon, LockIcon, LogInIcon },
  data () {
    return {
      username: '',
      password: '',
      errorMessage: ''
    }
  },
  created () {
    const currentUser = getCurrentUser()
    if (currentUser) {
      this.redirectByRole(currentUser.role)
    }
  },
  methods: {
    submitLogin () {
      const foundUser = users.find(
        user => user.username === this.username && user.password === this.password
      )
      if (!foundUser) {
        this.errorMessage = '帳號或密碼錯誤'
        return
      }
      this.errorMessage = ''
      this.$store.dispatch('login', foundUser)
      this.redirectByRole(foundUser.role)
    },
    quickLogin (role) {
      const foundUser = users.find(user => user.role === role)
      if (!foundUser) {
        this.errorMessage = '帳號或密碼錯誤'
        return
      }
      this.errorMessage = ''
      this.$store.dispatch('login', foundUser)
      this.redirectByRole(foundUser.role)
    },
    redirectByRole (role) {
      const targetPath = roleRedirectMap[role] || '/'
      this.$router.replace(targetPath)
    }
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--c-bg);
  padding: 24px;
}

.login-card {
  width: 100%;
  max-width: 420px;
  background: var(--c-surface);
  border: var(--border);
  border-radius: var(--r-lg);
  padding: var(--space-lg);
}

/* ── 標題區塊 ───────────────────────── */
.title-block {
  text-align: center;
  margin-bottom: 32px;
}

.system-title {
  font-family: var(--font-serif);
  font-size: 24px;
  font-weight: 600;
  color: var(--c-text-title);
  margin: 4px 0 6px;
  letter-spacing: 0.04em;
}

.system-sub {
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 400;
  color: var(--c-text-muted);
  margin: 0;
}

/* ── 表單 ───────────────────────────── */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.input-wrapper {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #94A3B8;
  pointer-events: none;
  flex-shrink: 0;
}

.icon-input {
  padding-left: 38px !important;
}

.field-label {
  font-family: var(--font-sans);
  font-size: 12px;
  font-weight: 500;
  color: var(--c-text-muted);
  letter-spacing: 0.04em;
}

.login-btn {
  width: 100%;
  height: 44px;
  font-size: 15px;
  letter-spacing: 0.06em;
  margin-top: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

/* ── 錯誤訊息 ───────────────────────── */
.error-message {
  margin: 16px 0 0;
  color: var(--c-danger);
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 400;
  text-align: center;
}

/* ── 快速登入 ───────────────────────── */
.quick-login {
  margin-top: 28px;
  padding-top: 24px;
  border-top: var(--border);
}

.quick-label {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 14px;
}

.quick-text {
  font-family: var(--font-sans);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.08em;
  color: var(--c-text-faint);
  text-transform: uppercase;
  white-space: nowrap;
}

.quick-line {
  flex: 1;
  height: 0.5px;
  background: var(--c-border);
}

.quick-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.quick-btn-wrap {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.quick-hint {
  font-size: 11px;
  color: var(--c-text-muted);
  font-family: var(--font-sans);
  padding-left: 2px;
}

.demo-note {
  margin: 20px 0 0;
  text-align: center;
  font-size: 10px;
  font-weight: 400;
  color: #94a3b8;
  font-family: var(--font-sans);
  letter-spacing: 0.02em;
}

.quick-button {
  height: 38px;
  border: var(--border);
  border-radius: var(--r-md);
  background: transparent;
  color: var(--c-primary);
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.03em;
  cursor: pointer;
  transition: background 0.15s;
}

.quick-button:hover {
  background: var(--c-primary-light);
}

@media (max-width: 480px) {
  .login-page {
    padding: 16px;
    align-items: flex-start;
    padding-top: 48px;
  }

  .login-card {
    padding: 24px 20px;
  }

  .quick-buttons {
    flex-direction: column;
  }
}
</style>
