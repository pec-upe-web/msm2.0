<template>
  <div id="app">
    <app-snackbar :message="snackbar.message" :type="snackbar.type" />
    <app-loading :show="false" />
    <router-view />
    <ThemeSwitcher />
  </div>
</template>

<script>
import ThemeSwitcher from './components/ThemeSwitcher.vue'
export default {
  name: 'App',
  components: { ThemeSwitcher },
  computed: {
    snackbar () {
      return this.$store.state.snackbar
    }
  }
}
</script>

<style>
/* ═══════════════════════════════════════════════
   全域設計 Token — B2B 下單系統
═══════════════════════════════════════════════ */
:root {
    /* 狀態徽章色盤（主題可覆蓋） */
    --badge-pending-bg: #eef3fb;
    --badge-pending-color: #1a2f5e;
    --badge-pending-border: #c4d4ec;
    --badge-pending-dot: #2e4f8a;
    --badge-shipped-bg: #edf7f1;
    --badge-shipped-color: #1a5c38;
    --badge-shipped-border: #a0d4b4;
    --badge-shipped-dot: #2a7a4a;
    --badge-transferred-bg: #f2eefb;
    --badge-transferred-color: #4a2a8c;
    --badge-transferred-border: #c0aae8;
    --badge-transferred-dot: #6040b0;
    --badge-error-bg: #fff1f0;
    --badge-error-color: #cf1322;
    --badge-error-border: #ffa39e;
    --badge-error-dot: #f5222d;
  /* 主題色盤（四組） */
  /* 商務深藍 */
  --business-primary: #2C3E50;
  --business-bg: #F4F7F6;
  --business-surface: #FFFFFF;
  --business-stripe: #F9FBFE;
  --business-border: #CBD5E1;
  --business-divider: #F1F5F9;
  --business-primary-light: #EEF3FB;
  --business-hover: #EEF3FB;
  /* 森林禪意 */
  --forest-primary: #3E4E50;
  --forest-bg: #FCFAF2;
  --forest-surface: #FFFFFF;
  --forest-stripe: #F5F3E7;
  --forest-border: #D6D2C4;
  --forest-divider: #EDE9DD;
  --forest-primary-light: #E8ECE9;
  --forest-hover: #E8ECE9;
  /* 霧灰石板 */
  --slate-primary: #546E7A;
  --slate-bg: #ECEFF1;
  --slate-surface: #FFFFFF;
  --slate-stripe: #F5F7F9;
  --slate-border: #B0BEC5;
  --slate-divider: #CFD8DC;
  --slate-primary-light: #E3E8EB;
  --slate-hover: #E3E8EB;
  /* 午夜莫蘭迪 */
  --morandi-primary: #4A4E69;
  --morandi-bg: #F2E9E4;
  --morandi-surface: #FFFFFF;
  --morandi-stripe: #F7F3F0;
  --morandi-border: #D6D1D8;
  --morandi-divider: #E9E4ED;
  --morandi-primary-light: #E6E6F2;
  --morandi-hover: #E6E6F2;
  /* 全站主題變數（預設商務深藍） */
  --c-primary: var(--business-primary);
  --c-bg: var(--business-bg);
  --c-surface: var(--business-surface);
  --c-stripe: var(--business-stripe);
  --c-border: var(--business-border);
  --c-divider: var(--business-divider);
  --c-primary-light: var(--business-primary-light);
  --c-hover: var(--business-hover);
  /* 文字色不隨主題變 */
  --c-text-title: #0F172A;
  --c-text-body: #334155;
  --c-text-muted: #64748B;
  --c-text-faint: #94A3B8;
  --c-danger: #8C2020;

  /* 字型 */
  --font-serif:  'Noto Serif TC', Georgia, serif;
  --font-sans:   'Noto Sans TC', 'Microsoft JhengHei', 'PingFang TC', sans-serif;
  --font-mono:   'JetBrains Mono', 'Cascadia Code', 'Courier New', monospace;

  /* 半徑 */
  --r-sm:  4px;
  --r-md:  8px;
  --r-lg:  12px;

  /* 線條 */
  --border: 0.5px solid var(--c-border);

  /* 間距 */
  --space-xs: 8px;
  --space-sm: 16px;
  --space-md: 24px;
  --space-lg: 32px;
}

/* ── Reset ────────────────────────────── */
*, *::before, *::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: var(--c-bg);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* ── 全域基本 ─────────────────────────── */
#app {
  min-height: 100vh;
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 400;
  line-height: 1.6;
  color: var(--c-text-body);
  background:
    radial-gradient(ellipse 80% 60% at 50% 40%, var(--c-bg) 0%, var(--c-surface) 100%);
  position: relative;
  overflow-x: hidden;
}

/* ── 點線網格 + 幾何裝飾 (底層) ─────────── */
#app::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background-image:
    /* 交點精密圓點 */
    radial-gradient(circle 1px, var(--c-surface) 1px, transparent 1px),
    /* 主題亮色連線 — 水平 */
    linear-gradient(rgba(var(--c-primary-rgb,44,62,80), 0.18) 0.5px, transparent 0.5px),
    /* 主題亮色連線 — 垂直 */
    linear-gradient(90deg, rgba(var(--c-primary-rgb,44,62,80), 0.18) 0.5px, transparent 0.5px),
    /* 幾何三角裝飾 — 左上 */
    linear-gradient(135deg, rgba(var(--c-primary-rgb,44,62,80), 0.04) 25%, transparent 25%),
    /* 幾何三角裝飾 — 右下 */
    linear-gradient(315deg, rgba(var(--c-primary-rgb,44,62,80), 0.03) 20%, transparent 20%);
  background-size:
    48px 48px,
    48px 48px,
    48px 48px,
    100% 100%,
    100% 100%;
}

/* ── 流動曲線 + 微光呼吸 ────────────────── */
#app::after {
  content: '';
  position: fixed;
  inset: 0;
  z-index: -2;
  pointer-events: none;
  background:
    /* 右上柔光 */
    radial-gradient(ellipse 50% 40% at 85% 15%, rgba(var(--c-primary-rgb,44,62,80), 0.12) 0%, transparent 70%),
    /* 左下柔光 */
    radial-gradient(ellipse 45% 50% at 15% 85%, rgba(var(--c-primary-rgb,44,62,80), 0.10) 0%, transparent 70%),
    /* 底部流動波紋 1 */
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='none' stroke='rgb(var(--c-primary-rgb,44,62,80))' stroke-width='0.8' opacity='0.18' d='M0,224C240,160,480,288,720,224C960,160,1200,288,1440,224'/%3E%3Cpath fill='none' stroke='rgb(var(--c-primary-rgb,44,62,80))' stroke-width='0.6' opacity='0.12' d='M0,256C240,192,480,320,720,256C960,192,1200,320,1440,256'/%3E%3C/svg%3E");
  background-size: 100% 100%, 100% 100%, 100% 320px;
  background-position: center, center, bottom;
  background-repeat: no-repeat, no-repeat, repeat-x;
  animation: glow-breathe 20s ease-in-out infinite alternate;
}

@keyframes glow-breathe {
  0%   { opacity: 1;    }
  50%  { opacity: 0.75; }
  100% { opacity: 1;    }
}

/* ── 訂單號 / 金額等寬字型 helper ──────── */
.mono {
  font-family: var(--font-mono);
  letter-spacing: 0.02em;
}

/* ── 頁面大標題輔助工具類 ───────────────
   在大標題上方插入 10px 英文輔助標籤
   用法：<span class="eyebrow">ORDER LIST</span>
   ─────────────────────────────────────── */
.eyebrow {
  display: block;
  font-family: var(--font-sans);
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--c-text-muted);
  margin-bottom: 4px;
}

/* ── 頁面標題塊（全站共用） ──────────── */
.page-title-block {
  padding-left: 14px;
  border-left: 3px solid var(--c-primary);
  margin-bottom: 16px;
}

.page-title {
  font-family: var(--font-serif);
  font-size: 20px;
  font-weight: 500;
  color: var(--c-text-title);
  margin: 0;
  letter-spacing: 0.01em;
}

/* ── 呼吸燈動畫 ──────────────────────── */
@keyframes pulse-live {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.4; transform: scale(0.75); }
}

/* ── 卡片通用 ─────────────────────────── */
.v-card {
  background: var(--c-surface);
  border: var(--border);  border-top: 2px solid var(--c-primary);  border-radius: var(--r-md);
  padding: var(--space-lg);
}

/* ── 表格通用 ─────────────────────────── */
.v-table {
  width: 100%;
  border-collapse: collapse;
}

.v-table th {
  padding: 14px 16px;
  font-family: var(--font-sans);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--c-text-muted);
  background: #F8FAFC;
  border-bottom: var(--border);
  text-align: left;
  white-space: nowrap;
}

.v-table td {
  padding: 14px 16px;
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 400;
  color: var(--c-text-body);
  border-bottom: 0.5px solid var(--c-divider);
}

.v-table tbody tr:last-child td {
  border-bottom: none;
}

.v-table tbody tr:nth-child(even) td {
  background: var(--c-stripe);
}

.v-table tbody tr {
  transition: background 0.1s;
}

.v-table tbody tr:hover td {
  background: #EEF3FB;
}

/* ── 主要按鈕 ─────────────────────────── */
.v-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 40px;
  padding: 0 20px;
  border: none;
  border-radius: var(--r-md);
  background: var(--c-primary);
  color: var(--c-surface);
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.05em;
  cursor: pointer;
  text-decoration: none;
  white-space: nowrap;
}

.v-btn--outline {
  background: transparent;
  border: 0.5px solid var(--c-primary);
  color: var(--c-primary);
}

.v-btn--ghost {
  background: none;
  border: none;
  color: var(--c-primary);
  padding: 0;
  height: auto;
}

/* ── 輸入框 ──────────────────────────── */
.v-input {
  width: 100%;
  height: 40px;
  padding: 0 14px;
  border: var(--border);
  border-radius: var(--r-md);
  background: var(--c-surface);
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 400;
  color: var(--c-text-body);
  outline: none;
  transition: border-color 0.15s;
}

.v-input::placeholder {
  color: var(--c-text-faint);
}

.v-input:focus {
  border-color: var(--c-primary);
}

/* ── select 重置 ─────────────────────── */
select.v-input {
  cursor: pointer;
}

/* ── 手機版響應式調整 ─────────────────── */
@media (max-width: 768px) {
  /* 標題字級縮放 */
  .page-title {
    font-size: 16px !important;
    letter-spacing: 0.01em !important;
  }

  /* 觸控高度：主要表單元素 */
  .v-input,
  select.v-input {
    min-height: 44px;
    height: 44px;
  }

  .v-btn {
    min-height: 44px;
    height: 44px;
  }
}

/* ── Lucide 圖示全域規範 ─────────────── */
/* 所有 lucide icon 自動繼承文字色，不可縮放 */
.lucide {
  flex-shrink: 0;
  vertical-align: middle;
}
</style>
