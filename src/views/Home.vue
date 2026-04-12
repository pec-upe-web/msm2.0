<template>
  <div class="home-page">

    <!-- 客戶儀表板 -->
    <template v-if="currentUser.role === 'customer'">

      <!-- 快速入口 -->
      <section class="quick-entry-section">
        <router-link class="sales-entry-btn" to="/products">
          <div class="entry-icon-box">
            <package-icon :size="20" :stroke-width="1.5" />
          </div>
          <div class="entry-body">
            <span class="entry-label">瀏覽產品目錄</span>
            <span class="entry-desc">查看最新商品與庫存</span>
          </div>
        </router-link>
        <router-link class="sales-entry-btn" to="/cart">
          <div class="entry-icon-box">
            <shopping-cart-icon :size="20" :stroke-width="1.5" />
          </div>
          <div class="entry-body">
            <span class="entry-label">查看購物車</span>
            <span class="entry-desc">確認並送出訂單</span>
          </div>
        </router-link>
      </section>

      <!-- 2 欄主體：公告 + 最近訂單 -->
      <div class="dashboard-grid">

        <!-- 公告區塊 -->
        <section class="dashboard-card">
          <h3 class="card-title">最新公告</h3>
          <ul class="notice-list">
            <li v-for="notice in notices" :key="notice.id" class="notice-item notice-clickable" @click="openNotice(notice)">
              <span class="notice-date">{{ notice.date }}</span>
              <span class="notice-title">{{ notice.title }}</span>
            </li>
          </ul>
        </section>

        <!-- 最近訂單區塊 -->
        <section class="dashboard-card">
          <h3 class="card-title">最近訂單</h3>
          <ul class="order-list">
            <li v-for="order in recentOrders" :key="order.orderId" class="order-item">
              <div class="order-left">
                <span class="order-id">{{ order.orderId }}</span>
                <status-badge :status="order.status" :viewer-role="currentUser.role" />
              </div>
              <span class="order-amount">NT$ {{ order.amount.toLocaleString() }}</span>
            </li>
          </ul>
          <div class="card-footer">
            <router-link class="view-all-link" to="/orders">查看全部訂單</router-link>
          </div>
        </section>

      </div>
    </template>

    <!-- Sales 儀表板 -->
    <template v-else-if="currentUser.role === 'sales'">

      <!-- 上排：待審核 + 今日班表 -->
      <div class="dashboard-grid sales-top-grid">

        <!-- 待審核訂單卡片 -->
        <section class="pending-card">
          <div class="pending-number">{{ pendingCount }}</div>
          <div class="pending-approval-label">PENDING APPROVAL</div>
          <div class="pending-sub">筆訂單待審核</div>
          <router-link class="pending-btn" to="/orders?filter=pending">前往審單</router-link>
        </section>

        <!-- 今日班表卡片 -->
        <section class="dashboard-card">
          <div class="card-title-row">
            <span class="card-title-dot"></span>
            <h3 class="card-title card-title--serif">今日班表・{{ todayLabel }}</h3>
            <span class="card-eyebrow">SCHEDULE</span>
          </div>
          <ul class="schedule-list">
            <li v-for="(appt, idx) in schedule" :key="idx" class="schedule-item">
              <div class="timeline-track">
                <span class="sched-dot"></span>
                <span v-if="idx < schedule.length - 1" class="sched-line"></span>
              </div>
              <div class="appt-info">
                <span class="appt-customer">{{ appt.customer }}</span>
                <span class="appt-address">{{ appt.address }}</span>
              </div>
            </li>
          </ul>
        </section>

      </div>

      <!-- 個人業績圖（by 業務員） -->
      <div class="sales-chart-grid">
        <section class="dashboard-card chart-card">
          <div class="card-title-row">
            <span class="card-title-dot"></span>
            <h3 class="card-title">當月目前業績圖</h3>
            <span class="card-eyebrow">PERSONAL MTD</span>
          </div>
          <p class="chart-meta">業務員：{{ currentUser.name }}</p>
          <img class="chart-image" :src="salesTrendChartSrc" :alt="currentUser.name + ' 當月業績趨勢圖'" />
          <div class="chart-kpi-row">
            <span class="kpi-label">目前業績</span>
            <span class="kpi-value">NT$ {{ currentSalesAmount.toLocaleString() }}</span>
          </div>
        </section>

        <section class="dashboard-card chart-card">
          <div class="card-title-row">
            <span class="card-title-dot"></span>
            <h3 class="card-title">目標差距圖</h3>
            <span class="card-eyebrow">GAP TO TARGET</span>
          </div>
          <p class="chart-meta">目前達成：{{ achievementRate }}%</p>
          <img class="chart-image" :src="salesGapChartSrc" :alt="currentUser.name + ' 業績目標差距圖'" />
          <div class="chart-kpi-row">
            <span class="kpi-label">尚差目標</span>
            <span class="kpi-value is-gap">NT$ {{ gapAmount.toLocaleString() }}</span>
          </div>
        </section>
      </div>

      <!-- 快速入口 -->
      <section class="sales-entry-section">
        <div class="section-head">
          <span class="section-eyebrow">QUICK START</span>
        </div>
        <router-link class="sales-entry-btn" to="/orders">
          <div class="entry-icon-box">
            <file-text-icon :size="20" :stroke-width="1.5" />
          </div>
          <div class="entry-body">
            <span class="entry-label">訂單列表</span>
            <span class="entry-desc">查看所有客戶訂單</span>
          </div>
        </router-link>

        <router-link class="sales-entry-btn" to="/inventory-checks">
          <div class="entry-icon-box">
            <clipboard-check-icon :size="20" :stroke-width="1.5" />
          </div>
          <div class="entry-body">
            <span class="entry-label">盤點作業</span>
            <span class="entry-desc">管理庫存盤點記錄</span>
          </div>
        </router-link>
        <router-link class="sales-entry-btn" to="/promotions">
          <div class="entry-icon-box">
            <gift-icon :size="20" :stroke-width="1.5" />
          </div>
          <div class="entry-body">
            <span class="entry-label">市場活動</span>
            <span class="entry-desc">查看促銷與贈品規則</span>
          </div>
        </router-link>
      </section>

    </template>

    <!-- 其他角色：通用歡迎頁 -->
    <template v-else>
      <section class="hero-card">
        <span class="eyebrow">MSM-CORE / DASHBOARD</span>
        <h2 class="hero-title">歡迎使用 B2B 訂單管理系統</h2>
        <p class="hero-sub">快速查看訂單、產品、庫存與促銷專區。</p>
      </section>
      <div class="overview-grid">
        <div class="overview-item">
          <span class="overview-label">角色</span>
          <span class="overview-value">{{ currentUser.role }}</span>
        </div>
        <div class="overview-item">
          <span class="overview-label">公司</span>
          <span class="overview-value">{{ currentUser.company }}</span>
        </div>
        <div class="overview-item">
          <span class="overview-label">帳號</span>
          <span class="overview-value">{{ currentUser.name }}</span>
        </div>
        <div class="overview-item">
          <span class="overview-label">提示</span>
          <span class="overview-value">請使用上方分頁導覽</span>
        </div>
      </div>
    </template>

    <!-- 公告詳情彈窗 -->
    <transition name="modal-fade">
      <div v-if="modal.visible" class="modal-overlay" @click.self="closeModal">
        <div class="modal-card" role="dialog" aria-modal="true">
          <div class="modal-header">
            <div class="modal-meta">
              <span class="modal-date">{{ modal.notice.date }}</span>
              <span class="modal-category">{{ modal.notice.category }}</span>
            </div>
            <button class="modal-close-btn" @click="closeModal" aria-label="關閉">
              <x-icon :size="16" :stroke-width="1.5" />
            </button>
          </div>
          <h2 class="modal-title">{{ modal.notice.title }}</h2>
          <p class="modal-body">{{ modal.notice.body }}</p>
          <div class="modal-footer">
            <button class="modal-confirm-btn" @click="closeModal">我已瞭解</button>
          </div>
        </div>
      </div>
    </transition>

  </div>
</template>

<script>
import { getCurrentUser } from '../services/auth'
import { announcements } from '../mock/announcements'
import {
  Package as PackageIcon,
  ShoppingCart as ShoppingCartIcon,
  FileText as FileTextIcon,
  ClipboardCheck as ClipboardCheckIcon,
  Gift as GiftIcon,
  X as XIcon,
} from 'lucide-vue'

export default {
  name: 'HomePage',
  components: { PackageIcon, ShoppingCartIcon, FileTextIcon, ClipboardCheckIcon, GiftIcon, XIcon },
  data () {
    return {
      notices: announcements,
      modal: { visible: false, notice: null },
      schedule: [
        { time: '09:30', customer: '大洋貿易', address: '台北市中正區忠孝東路一段 1 號' },
        { time: '13:00', customer: '綠能物流', address: '新北市板橋區文化路二段 200 號' },
        { time: '15:30', customer: '宏達國際', address: '台北市信義區松高路 11 號' }
      ]
    }
  },
  computed: {
    ordersData () {
      return this.$store.state.orders || []
    },
    currentUser () {
      return getCurrentUser() || { role: '', company: '', name: '' }
    },
    recentOrders () {
      return this.ordersData.slice(0, 3)
    },
    pendingCount () {
      return this.ordersData.filter(o => o.status === 'pending').length
    },
    todayLabel () {
      const days = ['日', '一', '二', '三', '四', '五', '六']
      const now = new Date()
      const mm = String(now.getMonth() + 1).padStart(2, '0')
      const dd = String(now.getDate()).padStart(2, '0')
      return `${mm}/${dd}（週${days[now.getDay()]}）`
    },
    monthPrefix () {
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      return `${year}-${month}`
    },
    userSeed () {
      const key = this.currentUser.id || this.currentUser.name || 'sales'
      return key.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % 17
    },
    monthlyOrderAmount () {
      return this.ordersData
        .filter(o => (o.date || '').startsWith(this.monthPrefix))
        .reduce((sum, o) => sum + (Number(o.amount) || 0), 0)
    },
    monthlyTargetAmount () {
      return 160000 + this.userSeed * 3500
    },
    currentSalesAmount () {
      const personalRatio = 0.62 + (this.userSeed % 6) * 0.05
      const projected = Math.round(this.monthlyOrderAmount * personalRatio)
      return Math.max(projected, 38000 + this.userSeed * 1800)
    },
    achievementRate () {
      return Math.round((this.currentSalesAmount / this.monthlyTargetAmount) * 100)
    },
    gapAmount () {
      return Math.max(0, this.monthlyTargetAmount - this.currentSalesAmount)
    },
    trendSeries () {
      const current = this.currentSalesAmount
      const week1 = Math.round(current * 0.26)
      const week2 = Math.round(current * 0.55)
      const week3 = Math.round(current * 0.8)
      return [week1, week2, week3, current]
    },
    salesTrendChartSrc () {
      return this.buildTrendChart(this.trendSeries, this.monthlyTargetAmount)
    },
    salesGapChartSrc () {
      return this.buildGapChart(this.currentSalesAmount, this.monthlyTargetAmount)
    }
  },
  mounted () {
    document.addEventListener('keydown', this.handleKeydown)
    document.addEventListener('click', this.handleOutsideClick)
    if (this.currentUser.role === 'customer') {
      const dismissed = JSON.parse(sessionStorage.getItem('dismissedNotices') || '[]')
      const urgent = this.notices.find(n => n.isUrgent && !dismissed.includes(n.id))
      if (urgent) this.openNotice(urgent)
    }
  },
  beforeDestroy () {
    document.removeEventListener('keydown', this.handleKeydown)
    document.removeEventListener('click', this.handleOutsideClick)
  },
  methods: {
    buildTrendChart (values, target) {
      const width = 560
      const height = 220
      const left = 42
      const right = 20
      const top = 16
      const bottom = 36
      const maxY = Math.max(target, ...values, 1)
      const usableW = width - left - right
      const usableH = height - top - bottom
      const x = idx => left + (usableW / (values.length - 1)) * idx
      const y = val => top + usableH - (val / maxY) * usableH
      const points = values.map((v, i) => `${x(i)},${y(v)}`).join(' ')
      const area = `${left},${top + usableH} ${points} ${left + usableW},${top + usableH}`
      const targetY = y(target)
      const yTicks = [0, 0.5, 1].map(r => Math.round(maxY * r))
      const yLabels = yTicks.map(v => {
        const py = y(v)
        return `<text x="6" y="${py + 4}" fill="#94A3B8" font-size="10">${Math.round(v / 1000)}k</text>`
      }).join('')
      const weekLabels = ['W1', 'W2', 'W3', 'W4'].map((w, i) => {
        return `<text x="${x(i) - 10}" y="208" fill="#64748B" font-size="11">${w}</text>`
      }).join('')
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
        <defs>
          <linearGradient id="trendFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stop-color="#3B82F6" stop-opacity="0.28"/>
            <stop offset="100%" stop-color="#3B82F6" stop-opacity="0.03"/>
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="${width}" height="${height}" fill="#FFFFFF"/>
        <line x1="${left}" y1="${top + usableH}" x2="${left + usableW}" y2="${top + usableH}" stroke="#E2E8F0"/>
        <line x1="${left}" y1="${top}" x2="${left}" y2="${top + usableH}" stroke="#E2E8F0"/>
        <line x1="${left}" y1="${targetY}" x2="${left + usableW}" y2="${targetY}" stroke="#F59E0B" stroke-dasharray="5 4"/>
        <text x="${left + usableW - 92}" y="${targetY - 6}" fill="#B45309" font-size="10">目標 ${Math.round(target / 1000)}k</text>
        <polygon points="${area}" fill="url(#trendFill)"/>
        <polyline points="${points}" fill="none" stroke="#2563EB" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        ${values.map((v, i) => `<circle cx="${x(i)}" cy="${y(v)}" r="3.8" fill="#2563EB"/>`).join('')}
        ${yLabels}
        ${weekLabels}
      </svg>`
      return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
    },
    buildGapChart (current, target) {
      const width = 560
      const height = 220
      const pad = 28
      const barW = 160
      const maxY = Math.max(target, current, 1)
      const chartTop = 20
      const chartBottom = 170
      const y = val => chartBottom - (val / maxY) * (chartBottom - chartTop)
      const bars = [
        { label: '目前', value: current, color: '#2563EB', x: pad + 80 },
        { label: '目標', value: target, color: '#F59E0B', x: pad + 320 }
      ]
      const barSvg = bars.map(bar => {
        const h = chartBottom - y(bar.value)
        const valueText = Math.round(bar.value / 1000) + 'k'
        return `<g>
          <rect x="${bar.x}" y="${y(bar.value)}" width="${barW}" height="${h}" rx="8" fill="${bar.color}" fill-opacity="0.9"/>
          <text x="${bar.x + 58}" y="${y(bar.value) - 8}" fill="#334155" font-size="11">${valueText}</text>
          <text x="${bar.x + 64}" y="192" fill="#64748B" font-size="11">${bar.label}</text>
        </g>`
      }).join('')
      const gap = Math.max(0, target - current)
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
        <rect x="0" y="0" width="${width}" height="${height}" fill="#FFFFFF"/>
        <line x1="${pad}" y1="${chartBottom}" x2="${width - pad}" y2="${chartBottom}" stroke="#E2E8F0"/>
        ${barSvg}
        <text x="${pad}" y="18" fill="#B91C1C" font-size="12">差距 NT$ ${gap.toLocaleString()}</text>
      </svg>`
      return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
    },
    openNotice (notice) {
      this.modal = { visible: true, notice }
    },
    closeModal () {
      if (this.modal.notice && this.modal.notice.isUrgent) {
        const dismissed = JSON.parse(sessionStorage.getItem('dismissedNotices') || '[]')
        if (!dismissed.includes(this.modal.notice.id)) {
          dismissed.push(this.modal.notice.id)
          sessionStorage.setItem('dismissedNotices', JSON.stringify(dismissed))
        }
      }
      this.modal = { visible: false, notice: null }
    },
    handleOutsideClick () {
    },
    handleKeydown (e) {
      if (e.key === 'Escape') {
        if (this.showPicker) this.showPicker = false
        if (this.modal.visible) this.closeModal()
      }
    }
  }
}
</script>

<style scoped>
.home-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* ── 快速入口 ─────────────────────────────── */
.quick-entry-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.entry-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 24px 16px;
  background: var(--c-primary-light);
  border: var(--border);
  border-radius: 8px;
  color: var(--c-primary);
  text-decoration: none;
}

.entry-icon {
  flex-shrink: 0;
  color: currentColor;
}

.entry-label {
  font-size: 14px;
  font-weight: 500;
}

/* ── 2 欄 Grid ────────────────────────────── */
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  align-items: stretch;
  /* Equal Height Columns：強制等高對齊 */
  grid-auto-rows: 1fr;
}
.sales-top-grid {
  grid-template-columns: 1fr 1fr;
  align-items: stretch;
}
/* ── 卡片通用 ─────────────────────────────── */
.dashboard-card {
  border: 1px solid var(--c-border);
  border-top: 2px solid var(--c-primary);
  border-radius: 8px;
  background: var(--c-surface);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.card-title {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: #0F172A;
}

.card-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-title-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--c-primary);
  flex-shrink: 0;
}

.card-eyebrow {
  font-size: 10px;
  font-weight: 600;
  color: #94A3B8;
  letter-spacing: 0.12em;
  margin-left: auto;
}

.card-title--serif {
  font-family: var(--font-serif);
}

/* ── 公告 ─────────────────────────────────── */
.notice-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
}

.notice-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-bottom: 12px;
  border-bottom: 0.5px solid var(--c-divider);
}

.notice-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.notice-date {
  font-size: 12px;
  font-weight: 400;
  color: #8b95a8;
}

.notice-title {
  font-size: 13px;
  font-weight: 400;
  color: #334155;
  line-height: 1.5;
}

/* ── 最近訂單 ─────────────────────────────── */
.order-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
}

.order-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding-bottom: 12px;
  border-bottom: 0.5px solid var(--c-divider);
}

.order-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.order-left {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.order-id {
  font-size: 13px;
  font-weight: 500;
  color: #334155;
  flex-shrink: 0;
}

.order-amount {
  font-size: 13px;
  font-weight: 500;
  color: #334155;
  flex-shrink: 0;
  font-family: var(--font-mono);
}

.card-footer {
  margin-top: auto;
  padding-top: 12px;
  border-top: 0.5px solid var(--c-divider);
}

.view-all-link {
  font-size: 13px;
  font-weight: 400;
  color: var(--c-primary);
  text-decoration: none;
}

/* ── 通用歡迎頁（非 customer） ────────────── */
.hero-card {
  padding: 24px;
  border: 0.5px solid var(--c-border);
  border-radius: 8px;
  background: var(--c-surface);
}

.hero-title {
  margin: 4px 0 10px;
  font-family: var(--font-serif);
  font-size: 22px;
  font-weight: 600;
  color: var(--c-text-title);
  letter-spacing: 0.02em;
}

.hero-sub {
  margin: 0;
  font-size: 14px;
  font-weight: 400;
  color: var(--c-text-muted);
}

.overview-item {

  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 16px;
  border: 0.5px solid var(--c-border);
  border-radius: 8px;
  background: var(--c-surface);
  transition: background 0.1s;
}
.overview-item:hover {
  background: var(--c-stripe);
}

.overview-label {
  font-size: 12px;
  font-weight: 400;
  color: #8b95a8;
}

.overview-value {
  font-size: 14px;
  font-weight: 500;
  color: #334155;
}

/* ── Sales 快速入口 ───────────────────────── */
.sales-entry-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* ── Sales 業績圖區 ─────────────────────── */
.sales-chart-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.chart-card {
  min-height: 420px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.chart-meta {
  margin: 0;
  font-size: 12px;
  color: #64748B;
  min-height: 18px;
}

.chart-image {
  width: 100%;
  height: 230px;
  object-fit: contain;
  border: 0.5px solid #E2E8F0;
  border-radius: 6px;
  background: #ffffff;
}

.chart-kpi-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 6px;
  border-top: 0.5px solid #E2E8F0;
}

.kpi-label {
  font-size: 12px;
  color: #64748B;
}

.kpi-value {
  font-family: var(--font-mono);
  font-size: 15px;
  font-weight: 600;
  color: #0F172A;
}

.kpi-value.is-gap {
  color: #B91C1C;
}

.section-head {
  display: flex;
  align-items: center;
}

.section-eyebrow {
  font-size: 10px;
  font-weight: 600;
  color: #94A3B8;
  letter-spacing: 0.12em;
}

.sales-entry-btn {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  background: #ffffff;
  border: 0.5px solid var(--c-border);
  border-radius: 8px;
  text-decoration: none;
  transition: background 0.15s;
  color: inherit;
}

.sales-entry-btn:hover {
  background: #F8FAFC;
}

.entry-icon-box {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F1F5F9;
  border-radius: 8px;
  color: var(--c-primary);
}

.entry-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sales-entry-btn .entry-label {
  font-size: 15px;
  font-weight: 500;
  color: #1E293B;
}

.entry-desc {
  font-size: 12px;
  font-weight: 400;
  color: #94A3B8;
}

/* ── 待審核訂單卡片 ────────────────────────── */
.pending-card {
  border: 1px solid var(--c-border);
  border-top: 2px solid var(--c-primary);
  border-radius: 8px;
  background: #ffffff;
  padding: 20px 18px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.pending-number {
  font-family: var(--font-mono);
  font-size: 48px;
  font-weight: 500;
  color: var(--c-primary);
  line-height: 1;
}

.pending-approval-label {
  font-size: 10px;
  font-weight: 600;
  color: #94A3B8;
  letter-spacing: 0.12em;
  margin-bottom: 4px;
}

.pending-sub {
  font-size: 14px;
  font-weight: 400;
  color: #4b5568;
}

.pending-btn {
  align-self: flex-start;
  margin-top: 12px;
  padding: 8px 16px;
  background: #FDF8EE;
  color: #8A6A28;
  border: 0.5px solid #DFC97A;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
}

/* ── 班表 ──────────────────────────────────── */
.schedule-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
}

.schedule-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 8px 0;
}

.schedule-item:last-child {
  padding-bottom: 0;
}

.timeline-track {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 9px;
  flex-shrink: 0;
  padding-top: 2px;
}

.sched-dot {
  width: 9px;
  height: 9px;
  border: 1.5px solid var(--c-primary);
  border-radius: 50%;
  background: #ffffff;
  flex-shrink: 0;
}

.sched-line {
  width: 0.5px;
  flex: 1;
  min-height: 16px;
  background: var(--c-border);
  margin-top: 3px;
}

.appt-time {
  font-size: 13px;
  font-weight: 500;
  color: var(--c-primary);
  flex-shrink: 0;
  width: 42px;
}

.appt-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.appt-customer {
  font-size: 13px;
  font-weight: 500;
  color: #334155;
}

.appt-address {
  font-size: 12px;
  font-weight: 400;
  color: #8b95a8;
}

/* ── 公告點擊 ─────────────────────────────── */
.notice-clickable {
  cursor: pointer;
}
.notice-clickable:hover .notice-title {
  color: var(--c-primary);
}

/* ── 公告 Modal ───────────────────────────── */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(10, 20, 48, 0.55);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

.modal-card {
  width: 100%;
  max-width: 480px;
  background: #ffffff;
  border: 0.5px solid var(--c-border);
  border-top: 2px solid var(--c-primary);
  border-radius: var(--r-lg);
  padding: 24px 24px 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.modal-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.modal-date {
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 400;
  color: var(--c-text-muted);
  letter-spacing: 0.03em;
}

.modal-category {
  font-size: 11px;
  font-weight: 500;
  color: var(--c-primary);
  background: var(--c-primary-light);
  border: 0.5px solid #C5D5F0;
  border-radius: 4px;
  padding: 2px 8px;
  letter-spacing: 0.04em;
}

.modal-close-btn {
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 0.5px solid var(--c-border);
  border-radius: var(--r-sm);
  color: var(--c-text-muted);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.modal-close-btn:hover {
  background: #F1F5F9;
  color: var(--c-primary);
}

.modal-title {
  margin: 0;
  font-family: var(--font-serif);
  font-size: 17px;
  font-weight: 600;
  color: var(--c-text-title);
  line-height: 1.55;
  letter-spacing: 0.02em;
}

.modal-body {
  margin: 0;
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 400;
  color: var(--c-text-body);
  line-height: 1.85;
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 12px;
  border-top: 0.5px solid var(--c-divider);
}

.modal-confirm-btn {
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  background: var(--c-primary);
  border: none;
  border-radius: var(--r-sm);
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 500;
  color: #ffffff;
  cursor: pointer;
  letter-spacing: 0.02em;
  transition: opacity 0.15s;
}

.modal-confirm-btn:hover {
  opacity: 0.88;
}

/* Modal 淡入淡出動畫 */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}
.modal-fade-enter,
.modal-fade-leave-to {
  opacity: 0;
}

/* ── RWD ──────────────────────────────────── */
@media (max-width: 768px) {
  .quick-entry-section,
  .dashboard-grid,
  .overview-grid,
  .sales-chart-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}

@media (max-width: 480px) {
  .modal-overlay {
    padding: 16px;
    align-items: flex-end;
  }
  .modal-card {
    max-width: 100%;
    border-radius: var(--r-md) var(--r-md) var(--r-sm) var(--r-sm);
  }
}
</style>
