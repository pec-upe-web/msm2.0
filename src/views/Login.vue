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
        <div class="role-grid">
          <button type="button" class="role-card" @click="quickLogin('customer')">
            <shopping-cart-icon :size="20" :stroke-width="1.5" class="role-icon" />
            <span class="role-name">客戶</span>
            <span class="role-hint">可體驗下單流程</span>
          </button>
          <button type="button" class="role-card" @click="quickLogin('sales')">
            <briefcase-icon :size="20" :stroke-width="1.5" class="role-icon" />
            <span class="role-name">銷售人員</span>
            <span class="role-hint">審單・盤點・活動</span>
          </button>
          <button type="button" class="role-card" @click="quickLogin('company_admin')">
            <building2-icon :size="20" :stroke-width="1.5" class="role-icon" />
            <span class="role-name">公司管理員</span>
            <span class="role-hint">可查看訂單列表</span>
          </button>
          <button type="button" class="role-card" @click="quickLogin('group_admin')">
            <globe-icon :size="20" :stroke-width="1.5" class="role-icon" />
            <span class="role-name">群管理員</span>
            <span class="role-hint">可查看跨公司訂單</span>
          </button>
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
  LogIn as LogInIcon,
  ShoppingCart as ShoppingCartIcon,
  Briefcase as BriefcaseIcon,
  Building2 as Building2Icon,
  Globe as GlobeIcon
} from 'lucide-vue'

const roleRedirectMap = {
  customer: '/',
  sales: '/',
  company_admin: '/orders',
  group_admin: '/orders'
}

export default {
  name: 'LoginPage',
  components: { UserIcon, LockIcon, LogInIcon, ShoppingCartIcon, BriefcaseIcon, Building2Icon, GlobeIcon },
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
  mounted () {
    // 登入頁進入時立即套用 localStorage 主題
    const theme = localStorage.getItem('theme')
    if (theme) {
      try {
        const themeVars = JSON.parse(localStorage.getItem('themeVars') || '{}')
        Object.entries(themeVars).forEach(([k, v]) => {
          document.documentElement.style.setProperty(k, v)
        })
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('主題變數套用失敗', e)
      }
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
  padding: 24px;
  position: relative;
  overflow: hidden;
  /* ── 主題漸層底色 ─── */
  background:
    linear-gradient(160deg, var(--c-bg-gradient1, #56CCF2) 0%, var(--c-bg-gradient2, #3B82F6) 35%, var(--c-bg-gradient3, #1E3A8A) 100%);
}

/* ── 點線網格層 ─────────────────────── */
.login-page::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image:
    /* 連線交點白色圓點 */
    radial-gradient(circle 2px, rgba(255,255,255,0.55) 1.5px, transparent 2px),
    /* 水平細線 */
    linear-gradient(rgba(255,255,255,0.10) 0.5px, transparent 0.5px),
    /* 垂直細線 */
    linear-gradient(90deg, rgba(255,255,255,0.10) 0.5px, transparent 0.5px),
    /* 對角連線 45° */
    repeating-linear-gradient(
      45deg,
      transparent 0px,
      transparent 67px,
      rgba(255,255,255,0.06) 67px,
      rgba(255,255,255,0.06) 68px
    ),
    /* 對角連線 -45° */
    repeating-linear-gradient(
      -45deg,
      transparent 0px,
      transparent 67px,
      rgba(255,255,255,0.06) 67px,
      rgba(255,255,255,0.06) 68px
    );
  background-size:
    48px 48px,
    48px 48px,
    48px 48px,
    auto,
    auto;
}

/* ── 幾何三角光影 + 漂浮微光 ─────────── */
.login-page::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    /* 右上三角光影 */
    linear-gradient(215deg, rgba(255,255,255,0.15) 0%, transparent 45%),
    /* 左下三角光影 */
    linear-gradient(35deg, rgba(255,255,255,0.08) 0%, transparent 40%),
    /* 中央散射微光 */
    radial-gradient(ellipse 60% 50% at 55% 45%, rgba(255,255,255,0.12) 0%, transparent 65%),
    /* 右下角高光點 */
    radial-gradient(circle 200px at 85% 80%, rgba(86,204,242,0.30) 0%, transparent 100%),
    /* 左上角深邃暗角 */
    radial-gradient(circle 300px at 10% 15%, rgba(30,58,138,0.25) 0%, transparent 100%);
  animation: login-shimmer 25s ease-in-out infinite alternate;
}

@keyframes login-shimmer {
  0%   { opacity: 1;    }
  50%  { opacity: 0.8;  }
  100% { opacity: 1;    }
}

.login-card {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 420px;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--r-lg);
  padding: var(--space-lg);
  /* backdrop-filter: blur(8px); */
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
  margin-top: 24px;
  padding-top: 20px;
  border-top: 0.5px solid #E8ECF2;
}

.quick-label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 12px;
}

.quick-text {
  font-family: var(--font-sans);
  font-size: 11px;
  font-weight: 400;
  letter-spacing: 0.06em;
  color: #B8C4D0;
  white-space: nowrap;
}

.quick-line {
  flex: 1;
  height: 0.5px;
  background: #E8ECF2;
}

/* ── 2x2 角色網格 ───────────────────── */
.role-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.role-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 14px 8px 10px;
  background: var(--c-stripe);
  border: 0.5px solid var(--c-border);
  border-radius: var(--r-md);
  cursor: pointer;
  font-family: var(--font-sans);
  text-align: center;
  transition: background 0.18s, border-color 0.18s, color 0.18s;
  position: relative;
  overflow: hidden;
}

.role-icon {
  color: var(--c-primary);
  flex-shrink: 0;
  transition: color 0.18s;
}

.role-name {
  font-size: 12px;
  font-weight: 500;
  color: #334155;
  letter-spacing: 0.02em;
  transition: color 0.18s;
}

.role-hint {
  font-size: 10px;
  font-weight: 400;
  color: #94A3B8;
  letter-spacing: 0.01em;
  opacity: 0;
  max-height: 0;
  overflow: hidden;
  transition: opacity 0.18s, max-height 0.18s;
  transition: color 0.18s, opacity 0.2s;
}

.role-card:hover {
  background: var(--c-primary);
  border-color: var(--c-primary);
}

.role-card:hover .role-icon {
  color: #ffffff;
}

.role-card:hover .role-name {
  color: #ffffff;
}

.role-card:hover .role-hint {
  color: rgba(255, 255, 255, 0.65);
  opacity: 1;
  max-height: 20px;
}

.demo-note {
  margin: 16px 0 0;
  text-align: center;
  font-size: 10px;
  font-weight: 400;
  color: #B8C4D0;
  font-family: var(--font-sans);
  letter-spacing: 0.02em;
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
