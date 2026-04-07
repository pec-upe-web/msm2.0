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
            <li v-for="notice in notices" :key="notice.id" class="notice-item">
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
                <status-badge :status="order.status" />
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
              <span class="appt-time">{{ appt.time }}</span>
              <div class="appt-info">
                <span class="appt-customer">{{ appt.customer }}</span>
                <span class="appt-address">{{ appt.address }}</span>
              </div>
            </li>
          </ul>
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
            <span class="entry-label">新增訂單</span>
            <span class="entry-desc">建立新的客戶訂單</span>
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

  </div>
</template>

<script>
import { getCurrentUser } from '../services/auth'
import { orders } from '../mock/orders'
import {
  Package as PackageIcon,
  ShoppingCart as ShoppingCartIcon,
  FileText as FileTextIcon,
  ClipboardCheck as ClipboardCheckIcon,
  Gift as GiftIcon
} from 'lucide-vue'

export default {
  name: 'HomePage',
  components: { PackageIcon, ShoppingCartIcon, FileTextIcon, ClipboardCheckIcon, GiftIcon },
  data () {
    return {
      notices: [
        { id: 1, date: '2026-04-01', title: '4 月份促銷活動正式開跑，滿 5 件即送贈品' },
        { id: 2, date: '2026-03-25', title: '系統維護公告：3/29 凌晨 2:00–4:00 暫停服務' },
        { id: 3, date: '2026-03-18', title: '新品上架：輕量防水工作鞋雙入包限量供應中' }
      ],
      schedule: [
        { time: '09:30', customer: '大洋貿易', address: '台北市中正區忠孝東路一段 1 號' },
        { time: '13:00', customer: '綠能物流', address: '新北市板橋區文化路二段 200 號' },
        { time: '15:30', customer: '宏達國際', address: '台北市信義區松高路 11 號' }
      ]
    }
  },
  computed: {
    currentUser () {
      return getCurrentUser() || { role: '', company: '', name: '' }
    },
    recentOrders () {
      return orders.slice(0, 3)
    },
    pendingCount () {
      return orders.filter(o => o.status === 'pending').length
    },
    todayLabel () {
      const days = ['日', '一', '二', '三', '四', '五', '六']
      const now = new Date()
      const mm = String(now.getMonth() + 1).padStart(2, '0')
      const dd = String(now.getDate()).padStart(2, '0')
      return `${mm}/${dd}（週${days[now.getDay()]}）`
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
}
.sales-top-grid {
  grid-template-columns: 2fr 3fr;
  align-items: stretch;
}
/* ── 卡片通用 ─────────────────────────────── */
.dashboard-card {
  border: 1px solid var(--c-border);
  border-top: 2px solid var(--c-primary);
  border-radius: 8px;
  background: #ffffff;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.card-title {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
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
  background: #ffffff;
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

.overview-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.overview-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 16px;
  border: 0.5px solid var(--c-border);
  border-radius: 8px;
  background: #ffffff;
  transition: background 0.1s;
}

.overview-item:hover {
  background: #f8fafc;
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
  border: 1px solid var(--c-border);
  border-top: 2px solid var(--c-primary);
  border-radius: 8px;
  text-decoration: none;
  transition: background 0.15s;
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
  font-size: 16px;
  font-weight: 600;
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

/* ── RWD ──────────────────────────────────── */
@media (max-width: 768px) {
  .quick-entry-section,
  .dashboard-grid,
  .overview-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}
</style>
