<template>
  <div class="default-layout">
    <header class="layout-header">
      <div class="brand">
        <span class="live-dot" aria-hidden="true"></span>
        <span class="brand-logo">MSM 2.0</span>
        <span class="brand-sep" aria-hidden="true"></span>
        <span class="brand-name">行動訂單管理系統</span>
      </div>
      <nav class="layout-tabs">
        <router-link
          v-for="tab in visibleTabs"
          :key="tab.path"
          :to="tab.path"
          class="tab-item"
          exact
          active-class="is-active"
        >
          <component :is="tab.icon" :size="15" :stroke-width="1.5" class="tab-icon" />
          {{ tab.label }}
        </router-link>
      </nav>
      <div class="layout-profile">
        <div class="profile-text">
          <div>{{ currentUser.name }}</div>
          <div>{{ currentUser.company }}</div>
        </div>
        <button class="logout-button" @click="logoutUser">
          <log-out :size="14" :stroke-width="1.5" />
          登出
        </button>
      </div>
    </header>

    <main class="layout-main">
      <router-view />
    </main>

    <footer class="mobile-nav">
      <router-link
        v-for="tab in visibleTabs"
        :key="tab.path"
        :to="tab.path"
        class="mobile-tab"
        exact
        active-class="is-active"
      >
        <component :is="tab.icon" :size="20" :stroke-width="1.5" class="mobile-tab-icon" />
        <span class="mobile-tab-label">{{ tab.label }}</span>
      </router-link>
    </footer>
  </div>
</template>

<script>
import { getCurrentUser } from '../services/auth'
import {
  Home, Package, ShoppingCart, FileText, ClipboardCheck, Tag, LogOut
} from 'lucide-vue'

export default {
  name: 'DefaultLayout',
  components: { LogOut },
  data () {
    return {
      tabs: [
        { label: '首頁', path: '/', icon: Home },
        { label: '產品', path: '/products', roles: ['customer'], icon: Package },
        { label: '購物車', path: '/cart', roles: ['customer'], icon: ShoppingCart },
        { label: '訂單', path: '/orders', icon: FileText },
        { label: '庫存盤點', path: '/inventory-checks', roles: ['sales'], icon: ClipboardCheck },
        { label: '市場活動', path: '/promotions', roles: ['sales'], icon: Tag }
      ]
    }
  },
  computed: {
    currentUser () {
      return getCurrentUser() || { name: '訪客', company: '' }
    },
    visibleTabs () {
      return this.tabs.filter(tab => {
        if (!tab.roles) {
          return true
        }
        return tab.roles.includes(this.currentUser.role)
      })
    }
  },
  methods: {
    logoutUser () {
      this.$store.dispatch('logout')
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
.default-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--c-bg);
}

/* ── Header ─────────────────────────── */
.layout-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  height: 60px;
  background: var(--c-primary);
  border-bottom: none;
  position: sticky;
  top: 0;
  z-index: 200;
}

/* ── Brand ───────────────────────────── */
.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
  text-decoration: none;
}

.live-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #10B981;
  flex-shrink: 0;
  animation: pulse-live 2.4s ease-in-out infinite;
}

.brand-logo {
  font-family: var(--font-mono);
  font-size: 15px;
  font-weight: 500;
  color: #FFFFFF;
  letter-spacing: 0.06em;
  white-space: nowrap;
}

.brand-sep {
  width: 1px;
  height: 16px;
  background: rgba(255, 255, 255, 0.22);
  flex-shrink: 0;
}

.brand-name {
  font-family: var(--font-sans);
  font-size: 12px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.55);
  letter-spacing: 0.02em;
  white-space: nowrap;
}

/* ── Nav tabs ────────────────────────── */
.layout-tabs {
  display: flex;
  height: 60px;
  align-items: stretch;
  flex: 1;
  justify-content: center;
  padding: 0 24px;
  gap: 8px;
}

.tab-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0 18px;
  color: rgba(255, 255, 255, 0.55);
  text-decoration: none;
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 400;
  letter-spacing: 0.01em;
  transition: color 0.15s;
  white-space: nowrap;
  position: relative;
}

.tab-icon {
  flex-shrink: 0;
  color: currentColor;
}

.tab-item:hover {
  color: #FFFFFF;
}

.tab-item.is-active {
  color: #FFFFFF;
  font-weight: 600;
}

.tab-item.is-active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 18px;
  right: 18px;
  height: 2px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 2px 2px 0 0;
}

/* ── 使用者區塊 ──────────────────────── */
.layout-profile {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
}

.profile-text {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1px;
  font-family: var(--font-sans);
  font-size: 13px;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.65);
}

.logout-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border: 0.5px solid rgba(255, 255, 255, 0.28);
  background: transparent;
  color: rgba(255, 255, 255, 0.85);
  border-radius: 6px;
  cursor: pointer;
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 400;
  letter-spacing: 0.02em;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
}

.logout-button:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.55);
  color: #FFFFFF;
}

/* ── Main ────────────────────────────── */
.layout-main {
  flex: 1;
  padding: 32px;
  background: var(--c-bg);
}

/* ── 手機底部 Nav ─────────────────────── */
.mobile-nav {
  display: none;
  border-top: 0.5px solid var(--c-border);
  background: var(--c-surface);
  padding: 8px 0 max(8px, env(safe-area-inset-bottom));
}

.mobile-tab {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 20%;
  color: var(--c-text-muted);
  text-decoration: none;
  font-family: var(--font-sans);
  font-size: 11px;
  font-weight: 400;
  letter-spacing: 0.02em;
  padding: 4px 0;
  gap: 3px;
}

.mobile-tab-icon {
  flex-shrink: 0;
  color: currentColor;
}

.mobile-tab-label {
  line-height: 1;
}

.mobile-tab.is-active {
  color: var(--c-primary);
  font-weight: 500;
}

/* ── RWD 820px (中等螢幕) ─────────────── */
@media (max-width: 820px) {
  .layout-header {
    padding: 0 20px;
  }

  .layout-tabs {
    justify-content: flex-start;
    padding: 0 8px;
    overflow-x: auto;
    scrollbar-width: none;
  }

  .layout-tabs::-webkit-scrollbar {
    display: none;
  }

  .tab-item {
    flex-shrink: 0;
    font-size: 13px;
    padding: 0 12px;
  }

  .layout-main {
    padding: 20px 16px;
  }
}

/* ── RWD 768px (手機) ─────────────────── */
@media (max-width: 768px) {
  .layout-header {
    height: 52px;
    padding: 0 16px;
    position: sticky;
    top: 0;
  }

  .brand-sep,
  .brand-name {
    display: none;
  }

  .layout-tabs {
    display: none;
  }

  .profile-text {
    display: none;
  }

  .logout-button {
    min-height: 36px;
    padding: 0 12px;
    font-size: 12px;
  }

  .layout-main {
    padding: 16px;
    padding-bottom: calc(56px + max(8px, env(safe-area-inset-bottom)) + 16px);
  }

  .mobile-nav {
    display: flex;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 200;
    justify-content: stretch;
    height: calc(56px + max(0px, env(safe-area-inset-bottom)));
    padding: 0 0 max(0px, env(safe-area-inset-bottom));
    border-top: 0.5px solid var(--c-border);
    background: var(--c-surface);
  }

  .mobile-tab {
    flex: 1;
    width: auto;
    height: 56px;
    font-size: 10px;
    letter-spacing: 0.03em;
    padding: 0 4px;
  }
}
</style>
