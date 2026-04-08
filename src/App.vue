<template>
  <div id="app">
    <app-snackbar :message="snackbar.message" :type="snackbar.type" />
    <app-loading :show="false" />
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App',
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
  /* 色彩 */
  --c-primary:       #1A2F5E;
  --c-primary-light: #EEF3FB;
  --c-bg:            #F1F5F9;
  --c-surface:       #FFFFFF;
  --c-border:        #CBD5E1;
  --c-divider:       #F1F5F9;
  --c-stripe:        #F9FBFE;
  --c-text-title:    #0F172A;
  --c-text-body:     #334155;
  --c-text-muted:    #64748B;
  --c-text-faint:    #94A3B8;
  --c-danger:        #8C2020;

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
  background: #f0f7ff;
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
    radial-gradient(ellipse 80% 60% at 50% 40%, #f0f7ff 0%, #ffffff 100%);
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
    radial-gradient(circle 1px, #ffffff 1px, transparent 1px),
    /* 淺天藍連線 — 水平 */
    linear-gradient(rgba(186, 230, 253, 0.30) 0.5px, transparent 0.5px),
    /* 淺天藍連線 — 垂直 */
    linear-gradient(90deg, rgba(186, 230, 253, 0.30) 0.5px, transparent 0.5px),
    /* 大幾何三角裝飾 — 左上 */
    linear-gradient(135deg, rgba(59, 130, 246, 0.04) 25%, transparent 25%),
    /* 大幾何三角裝飾 — 右下 */
    linear-gradient(315deg, rgba(59, 130, 246, 0.03) 20%, transparent 20%);
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
    radial-gradient(ellipse 50% 40% at 85% 15%, rgba(186, 230, 253, 0.25) 0%, transparent 70%),
    /* 左下柔光 */
    radial-gradient(ellipse 45% 50% at 15% 85%, rgba(191, 219, 254, 0.20) 0%, transparent 70%),
    /* 底部流動波紋 1 */
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='none' stroke='%23bae6fd' stroke-width='0.8' opacity='0.18' d='M0,224C240,160,480,288,720,224C960,160,1200,288,1440,224'/%3E%3Cpath fill='none' stroke='%23bae6fd' stroke-width='0.6' opacity='0.12' d='M0,256C240,192,480,320,720,256C960,192,1200,320,1440,256'/%3E%3C/svg%3E");
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
  color: #FFFFFF;
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
