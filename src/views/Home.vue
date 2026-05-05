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

      <!-- 公告 / 促銷雙欄 -->
      <div class="dashboard-grid customer-board-grid">

        <!-- 公告區塊 -->
        <section class="dashboard-card compact-card">
          <div class="card-title-row">
            <span class="card-title-dot"></span>
            <h3 class="card-title">公告欄</h3>
            <span class="card-eyebrow">NOTICE</span>
          </div>
          <ul class="notice-list">
            <li
              v-for="notice in announcementItems"
              :key="notice.id"
              class="notice-item notice-clickable"
              @click="openNotice(notice)"
            >
              <span class="notice-date">{{ notice.date }}</span>
              <span class="notice-title">{{ notice.title }}</span>
            </li>
          </ul>
        </section>

        <!-- 促銷商品區塊 -->
        <section class="dashboard-card compact-card promo-card">
          <div class="card-title-row">
            <span class="card-title-dot"></span>
            <h3 class="card-title">促銷商品</h3>
            <gift-icon :size="13" :stroke-width="1.5" class="card-title-icon" />
            <span class="promo-badge promo-badge--home">PROMO</span>
          </div>
          <ul class="promo-list">
            <li v-for="promo in promotionPreviewItems" :key="promo.id" class="promo-item">
              <div class="promo-item-head">
                <span class="promo-name">{{ promo.name }}</span>
                <button
                  type="button"
                  class="promo-view-btn"
                  @click="openPromoModal(promo)"
                >
                  <span>查看詳情</span>
                  <span class="promo-view-arrow">›</span>
                </button>
              </div>
            </li>
          </ul>
          <button
            v-if="promotionOverflowCount > 0"
            type="button"
            class="promo-all-btn"
            @click="openPromoListModal"
          >
            查看全部 {{ promotionItems.length }} 個活動
          </button>
        </section>

      </div>

      <!-- 最近訂單 -->
      <section class="dashboard-card compact-card recent-orders-card">
        <div class="card-title-row">
          <span class="card-title-dot"></span>
          <h3 class="card-title">最近訂單</h3>
          <span class="card-eyebrow">LATEST</span>
        </div>
        <ul class="order-list">
          <li v-for="order in recentOrders" :key="order.orderId" class="order-item">
            <div class="order-left">
              <span class="order-id">{{ order.orderId }}</span>
              <status-badge :status="order.status" :viewer-role="currentUser.role" />
            </div>
            <span class="order-amount">$ {{ order.amount.toLocaleString() }}</span>
          </li>
        </ul>
        <div class="card-footer">
          <router-link class="view-all-link" to="/orders">查看全部訂單</router-link>
        </div>
      </section>
    </template>

    <!-- Sales 儀表板 -->
    <template v-else-if="currentUser.role === 'sales'">

      <!-- 上排：待審核 + 公佈欄 -->
      <div class="dashboard-grid sales-top-grid">

        <!-- 待審核訂單卡片 -->
        <section class="pending-card">
          <div class="pending-left">
            <div class="pending-number">{{ pendingCount }}</div>
            <div class="pending-approval-label">PENDING APPROVAL</div>
          </div>
          <div class="pending-right">
            <div class="pending-sub">筆訂單待審核</div>
            <router-link class="pending-btn" to="/orders?filter=pending">前往審單</router-link>
          </div>
        </section>

        <!-- 業務公佈欄 -->
        <section class="dashboard-card compact-card bulletin-card">
          <div class="card-title-row">
            <span class="card-title-dot"></span>
            <h3 class="card-title">公佈欄</h3>
            <bell-icon :size="13" :stroke-width="1.5" class="card-title-icon" />
            <span class="card-eyebrow">BULLETIN</span>
          </div>
          <ul class="bulletin-list">
            <li
              v-for="notice in salesBulletins"
              :key="notice.id"
              class="bulletin-item notice-clickable"
              @click="openNotice(notice)"
            >
              <span class="bulletin-date">{{ notice.date }}</span>
              <span class="bulletin-title">{{ notice.title }}</span>
            </li>
          </ul>
        </section>

      </div>

      <!-- 今日班表卡片 -->
      <section class="dashboard-card compact-card schedule-card">
        <div class="card-title-row">
          <span class="card-title-dot"></span>
          <h3 class="card-title card-title--serif">今日班表</h3>
          <span class="card-eyebrow">SCHEDULE</span>
        </div>
        <div class="schedule-sort-bar">
          <span class="schedule-sort-label">排序</span>
          <div class="schedule-sort-switch" role="tablist" aria-label="班表排序">
            <button
              type="button"
              :class="['schedule-sort-btn', { active: scheduleSortMode === 'default' }]"
              @click="scheduleSortMode = 'default'"
            >預設排序</button>
            <button
              type="button"
              :class="['schedule-sort-btn', { active: scheduleSortMode === 'distance' }]"
              :disabled="!scheduleCurrentLocation"
              @click="scheduleSortMode = 'distance'"
            >由近到遠</button>
          </div>
        </div>
        <ul class="schedule-list">
          <li
            v-for="(appt, idx) in schedule"
            :key="idx"
            :class="['schedule-item', 'schedule-item--clickable', { selected: selectedScheduleId === appt.customerId }]"
            tabindex="0"
            @mouseenter="setSelectedScheduleId(appt.customerId)"
            @mouseleave="clearSelectedScheduleId(appt.customerId)"
            @focus="setSelectedScheduleId(appt.customerId)"
            @blur="clearSelectedScheduleId(appt.customerId)"
          >
            <div class="timeline-track">
              <span class="sched-dot"></span>
              <span v-if="idx < schedule.length - 1" class="sched-line"></span>
            </div>
            <customer-list-item
              class="appt-info"
              :name="appt.customer || appt.name"
              :address="appt.address"
              :distance="appt.distance"
              :has-order="appt.hasOrder"
              :selected="selectedScheduleId === appt.customerId"
            />
            <div class="schedule-item-actions">
              <button type="button" class="schedule-action-btn" @click.stop="goToOrderWork(appt.customerId)">訂單建立</button>
              <button type="button" class="schedule-action-btn schedule-action-btn--secondary" @click.stop="goToInventoryWork(appt.customerId)">盤點</button>
            </div>
          </li>
        </ul>
        <div class="card-footer">
          <button class="view-all-link view-all-btn" @click="scheduleModal = true">查看更多班表</button>
        </div>
      </section>

      <!-- 當日業績統計 -->
      <section class="dashboard-card compact-card sales-summary-card">
        <div class="card-title-row">
          <span class="card-title-dot"></span>
          <h3 class="card-title">當日業績統計</h3>
          <span class="card-eyebrow">TODAY {{ referenceDateLabel }}</span>
        </div>
        <div class="sales-summary-grid">
          <div class="summary-metric">
            <span class="summary-label">當日成交客戶數</span>
            <span class="summary-value">{{ dailyUniqueCustomers }}</span>
          </div>
          <div class="summary-metric">
            <span class="summary-label">當日業績</span>
            <span class="summary-value">$ {{ dailyTotalAmount.toLocaleString() }}</span>
          </div>
        </div>
        <div class="sales-breakdown">
          <div class="breakdown-row">
            <span class="breakdown-label">業務下單</span>
            <span class="breakdown-value">$ {{ dailySalesAmount.toLocaleString() }}</span>
          </div>
          <div class="breakdown-row">
            <span class="breakdown-label">客戶下單</span>
            <span class="breakdown-value">$ {{ dailyCustomerAmount.toLocaleString() }}</span>
          </div>
        </div>
      </section>

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
            <span class="kpi-value">$ {{ currentSalesAmount.toLocaleString() }}</span>
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
            <span class="kpi-value is-gap">$ {{ gapAmount.toLocaleString() }}</span>
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

      <!-- 背景色設定 -->
      <section class="dashboard-card compact-card bg-theme-card">
        <div class="card-title-row">
          <span class="card-title-dot"></span>
          <h3 class="card-title">背景色設定</h3>
          <span class="card-eyebrow">BACKGROUND</span>
        </div>
        <ThemeSwitcher mode="panel" />
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

    <!-- 班表完整彈窗 -->
    <transition name="modal-fade">
      <div v-if="scheduleModal" class="modal-overlay" @click.self="scheduleModal = false">
        <div class="modal-card schedule-modal-card" role="dialog" aria-modal="true">
          <div class="modal-header">
            <div class="modal-meta">
              <span class="modal-date">{{ todayLabel }}</span>
              <span class="modal-category">SCHEDULE</span>
            </div>
            <button class="modal-close-btn" @click="scheduleModal = false" aria-label="關閉">
              <x-icon :size="16" :stroke-width="1.5" />
            </button>
          </div>
          <h2 class="modal-title">今日班表</h2>
          <div class="schedule-sort-bar schedule-sort-bar--modal">
            <span class="schedule-sort-label">排序</span>
            <div class="schedule-sort-switch" role="tablist" aria-label="完整班表排序">
              <button
                type="button"
                :class="['schedule-sort-btn', { active: scheduleSortMode === 'default' }]"
                @click="scheduleSortMode = 'default'"
              >預設排序</button>
              <button
                type="button"
                :class="['schedule-sort-btn', { active: scheduleSortMode === 'distance' }]"
                :disabled="!scheduleCurrentLocation"
                @click="scheduleSortMode = 'distance'"
              >由近到遠</button>
            </div>
          </div>
          <ul class="schedule-list schedule-modal-list">
            <li
              v-for="(appt, idx) in allSchedule"
              :key="idx"
              :class="['schedule-item', 'schedule-item--clickable', { selected: selectedScheduleId === appt.customerId }]"
              tabindex="0"
              @mouseenter="setSelectedScheduleId(appt.customerId)"
              @mouseleave="clearSelectedScheduleId(appt.customerId)"
              @focus="setSelectedScheduleId(appt.customerId)"
              @blur="clearSelectedScheduleId(appt.customerId)"
            >
            <div class="timeline-track">
              <span class="sched-dot"></span>
              <span v-if="idx < allSchedule.length - 1" class="sched-line"></span>
            </div>
            <customer-list-item
              class="appt-info"
              :name="appt.customer || appt.name"
              :address="appt.address"
              :distance="appt.distance"
              :has-order="appt.hasOrder"
              :selected="selectedScheduleId === appt.customerId"
            />
              <div class="schedule-item-actions">
                <button type="button" class="schedule-action-btn" @click.stop="goToOrderWork(appt.customerId)">訂單建立</button>
                <button type="button" class="schedule-action-btn schedule-action-btn--secondary" @click.stop="goToInventoryWork(appt.customerId)">盤點</button>
              </div>
            </li>
          </ul>
          <div class="modal-footer">
            <button class="modal-confirm-btn" @click="scheduleModal = false">關閉</button>
          </div>
        </div>
      </div>
    </transition>

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

    <!-- 促銷彈窗 -->
    <transition name="modal-fade">
      <div v-if="promoModal.visible" class="modal-overlay" @click.self="closePromoModal">
        <div class="modal-card promo-modal-card" role="dialog" aria-modal="true">
          <div class="modal-header">
            <div class="modal-meta">
              <span class="modal-date">{{ promoModal.mode === 'detail' && promoModalItem ? promoModalItem.dateText : 'PROMO' }}</span>
              <span class="modal-category promo-modal-category">
                {{ promoModal.mode === 'detail' ? 'PROMOTION' : 'ALL PROMO' }}
              </span>
            </div>
            <button class="modal-close-btn" @click="closePromoModal" aria-label="關閉">
              <x-icon :size="16" :stroke-width="1.5" />
            </button>
          </div>

          <template v-if="promoModal.mode === 'detail'">
            <h2 class="modal-title">{{ promoModalItem ? promoModalItem.name : '促銷活動' }}</h2>
            <p class="promo-modal-period" v-if="promoModalItem">
              促銷期間：{{ promoModalItem.startDate || '—' }} ～ {{ promoModalItem.endDate || '—' }}
            </p>
            <p class="promo-modal-desc" v-if="promoModalItem">{{ promoModalItem.description }}</p>
            <div v-if="promoModalItem" class="promo-modal-condition">
              <span class="promo-modal-label">條件</span>
              <span class="promo-modal-text">{{ promoConditionText(promoModalItem) }}</span>
            </div>
            <div v-if="promoModalItem && promoModalItem.gifts.length" class="promo-modal-gifts">
              <span class="promo-modal-label">贈品</span>
              <ul>
                <li v-for="gift in promoModalItem.gifts" :key="gift.name">
                  {{ gift.name }} × {{ gift.quantity }}
                </li>
              </ul>
            </div>
            <div class="modal-footer">
              <button class="modal-confirm-btn" @click="closePromoModal">關閉</button>
            </div>
          </template>

          <template v-else>
            <h2 class="modal-title">全部促銷活動</h2>
            <ul class="promo-modal-list">
              <li v-for="promo in promotionItems" :key="promo.id" class="promo-modal-list-item">
                <div class="promo-modal-list-main">
                  <span class="promo-modal-list-name">{{ promo.name }}</span>
                  <span class="promo-modal-list-date">{{ promo.dateText }}</span>
                </div>
                <button type="button" class="promo-modal-list-btn" @click="openPromoModal(promo)">
                  查看詳情
                </button>
              </li>
            </ul>
            <div class="modal-footer">
              <button class="modal-confirm-btn" @click="closePromoModal">關閉</button>
            </div>
          </template>
        </div>
      </div>
    </transition>

  </div>
</template>

<script>
import { getCurrentUser } from '../services/auth'
import { announcements } from '../mock/announcements'
import { promotions } from '../mock/promotions'
import { buildTodayStoreList } from '../mock/schedule'
import {
  Package as PackageIcon,
  ShoppingCart as ShoppingCartIcon,
  FileText as FileTextIcon,
  ClipboardCheck as ClipboardCheckIcon,
  Gift as GiftIcon,
  Bell as BellIcon,
  X as XIcon,
} from 'lucide-vue'
import CustomerListItem from '../components/CustomerListItem.vue'
import ThemeSwitcher from '../components/ThemeSwitcher.vue'

export default {
  name: 'HomePage',
  components: { PackageIcon, ShoppingCartIcon, FileTextIcon, ClipboardCheckIcon, GiftIcon, BellIcon, XIcon, CustomerListItem, ThemeSwitcher },
  data () {
    return {
      notices: announcements,
      promotions,
      modal: { visible: false, notice: null },
      promoModal: { visible: false, mode: 'list', promoId: null },
      scheduleModal: false,
      scheduleSortMode: 'default',
      scheduleCurrentLocation: null,
      selectedScheduleId: null
    }
  },
  computed: {
    announcementItems () {
      return this.notices.filter(notice => notice.category !== '促銷活動')
    },
    promotionItems () {
      const today = new Date()
      const toDate = value => {
        if (!value) return null
        const date = new Date(value)
        return Number.isNaN(date.getTime()) ? null : date
      }
      return this.promotions
        .filter(promo => {
          const start = toDate(promo.startDate)
          const end = toDate(promo.endDate)
          if (!start || !end) return true
          return end >= today
        })
        .map(promo => {
          const start = toDate(promo.startDate)
          const end = toDate(promo.endDate)
          const isCurrent = start && end ? start <= today && end >= today : true
          return {
            ...promo,
            isCurrent,
            statusLabel: isCurrent ? '目前' : '未來',
            statusClass: isCurrent ? 'is-current' : 'is-future',
            dateText: `${promo.startDate || '—'} ～ ${promo.endDate || '—'}`,
            gifts: Array.isArray(promo.gifts) ? promo.gifts : []
          }
        })
        .sort((a, b) => {
          if (a.isCurrent !== b.isCurrent) return a.isCurrent ? -1 : 1
          if (a.isCurrent) return (a.id || '').localeCompare(b.id || '', 'zh-TW')
          return (a.startDate || '').localeCompare(b.startDate || '', 'zh-TW')
        })
    },
    promotionPreviewItems () {
      return this.promotionItems.slice(0, 3)
    },
    promotionOverflowCount () {
      return Math.max(0, this.promotionItems.length - 3)
    },
    promoModalItem () {
      return this.promotionItems.find(promo => promo.id === this.promoModal.promoId) || null
    },
    salesBulletins () {
      return this.announcementItems.slice(0, 3)
    },
    todayOrderedCustomerIds () {
      return new Set(this.dailyOrders.map(order => order.customerId).filter(Boolean))
    },
    allSchedule () {
      return buildTodayStoreList(this.scheduleCurrentLocation, {
        orderCustomerIds: this.todayOrderedCustomerIds,
        radiusKm: 30,
        sortMode: this.scheduleSortMode
      })
    },
    schedule () {
      return this.allSchedule.slice(0, 3)
    },
    ordersData () {
      return this.$store.state.orders || []
    },
    currentUser () {
      return getCurrentUser() || { role: '', company: '', name: '' }
    },
    referenceDate () {
      const dates = this.ordersData
        .map(order => order.date)
        .filter(Boolean)
        .sort()
      return dates[dates.length - 1] || new Date().toISOString().slice(0, 10)
    },
    referenceDateLabel () {
      const parts = this.referenceDate.split('-')
      if (parts.length !== 3) return this.referenceDate
      return `${parts[1]}/${parts[2]}`
    },
    dailyOrders () {
      return this.ordersData.filter(order => order.date === this.referenceDate)
    },
    dailyCustomerOrders () {
      return this.dailyOrders.filter(order => order.source === 'customer')
    },
    dailySalesOrders () {
      return this.dailyOrders.filter(order => order.source === 'sales')
    },
    dailyCustomerAmount () {
      return this.dailyCustomerOrders.reduce((sum, order) => sum + (Number(order.amount) || 0), 0)
    },
    dailySalesAmount () {
      return this.dailySalesOrders.reduce((sum, order) => sum + (Number(order.amount) || 0), 0)
    },
    dailyTotalAmount () {
      return this.dailyCustomerAmount + this.dailySalesAmount
    },
    dailyUniqueCustomers () {
      return new Set(this.dailyOrders.map(order => order.customerId)).size
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
    this.loadCurrentLocationForSchedule()
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
        <text x="${pad}" y="18" fill="#B91C1C" font-size="12">差距 $ ${gap.toLocaleString()}</text>
      </svg>`
      return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
    },
    loadCurrentLocationForSchedule () {
      if (!navigator.geolocation) return
      navigator.geolocation.getCurrentPosition(
        pos => {
          this.scheduleCurrentLocation = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          }
        },
        () => {
          this.scheduleCurrentLocation = null
        },
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
      )
    },
    openNotice (notice) {
      this.modal = { visible: true, notice }
    },
    openPromoModal (promo) {
      if (!promo) return
      this.promoModal = { visible: true, mode: 'detail', promoId: promo.id }
    },
    openPromoListModal () {
      this.promoModal = { visible: true, mode: 'list', promoId: null }
    },
    closePromoModal () {
      this.promoModal = { visible: false, mode: 'list', promoId: null }
    },
    setSelectedScheduleId (customerId) {
      this.selectedScheduleId = customerId
    },
    clearSelectedScheduleId (customerId) {
      if (this.selectedScheduleId === customerId) {
        this.selectedScheduleId = null
      }
    },
    promoConditionText (promo) {
      if (!promo) return '—'
      if (promo.minTotalQty !== undefined) {
        return `單次購買任意商品累計滿 ${promo.minTotalQty} 箱`
      }
      if (promo.targetProductId && promo.minQty !== undefined) {
        return `購買指定商品累計滿 ${promo.minQty} 箱`
      }
      return promo.description || '—'
    },
    goToOrderWork (customerId) {
      if (!customerId) return
      this.$router.push({ path: '/orders/new/review', query: { customerId } })
    },
    goToInventoryWork (customerId) {
      if (!customerId) return
      this.$router.push({ path: '/inventory-checks/' + customerId, query: {} })
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
        if (this.scheduleModal) this.scheduleModal = false
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
  background: var(--color-background-page);
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
  grid-auto-rows: auto;
  align-items: stretch;
}
.customer-board-grid {
  grid-template-columns: 1fr 1fr;
  grid-auto-rows: auto;
}
/* ── 卡片通用 ─────────────────────────────── */
.dashboard-card {
  border: 1px solid var(--c-border);
  border-top: 2px solid var(--c-primary);
  border-radius: 8px;
  background: var(--c-surface);
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.compact-card {
  padding: 14px;
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

.card-title-icon {
  color: var(--c-primary);
  flex-shrink: 0;
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

/* ── 促銷商品 ─────────────────────────────── */
.promo-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.promo-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-bottom: 10px;
  border-bottom: 0.5px solid var(--c-divider);
}

.promo-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.promo-item-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.promo-name {
  min-width: 0;
  font-size: 13px;
  font-weight: 500;
  color: #1E293B;
  line-height: 1.45;
  flex: 1;
}

.promo-view-btn,
.promo-all-btn,
.promo-modal-list-btn {
  border: none;
  background: transparent;
  color: var(--c-primary);
  cursor: pointer;
  font: inherit;
}

.promo-badge--home {
  margin-left: auto;
}

.promo-view-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  padding: 0;
  color: #c2410c;
  font-size: 12px;
  font-weight: 500;
}

.promo-view-arrow {
  font-size: 16px;
  line-height: 1;
}

.promo-all-btn {
  align-self: flex-start;
  margin-top: 2px;
  padding: 0;
  color: #c2410c;
  font-size: 12px;
  font-weight: 500;
}

.promo-modal-category {
  background: linear-gradient(135deg, #fb923c 0%, #ef4444 100%);
}

.promo-modal-card {
  max-height: 80vh;
  overflow: hidden;
}

.promo-modal-period,
.promo-modal-desc,
.promo-modal-condition,
.promo-modal-gifts {
  font-size: 13px;
  line-height: 1.5;
  color: #334155;
}

.promo-modal-period {
  margin: 0;
  color: #64748B;
}

.promo-modal-desc {
  margin: 0;
}

.promo-modal-condition,
.promo-modal-gifts {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.promo-modal-label {
  font-size: 12px;
  font-weight: 600;
  color: #94A3B8;
}

.promo-modal-text {
  color: #334155;
}

.promo-modal-gifts ul {
  margin: 0;
  padding-left: 18px;
}

.promo-modal-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
  min-height: 0;
  max-height: 48vh;
}

.promo-modal-list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border: 0.5px solid var(--c-border);
  border-radius: 8px;
  background: var(--c-surface);
}

.promo-modal-list-main {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.promo-modal-list-name {
  font-size: 13px;
  font-weight: 500;
  color: #1E293B;
}

.promo-modal-list-date {
  font-size: 11px;
  color: #94A3B8;
}

.promo-modal-list-btn {
  flex-shrink: 0;
  padding: 0;
  font-size: 12px;
  font-weight: 500;
  color: #c2410c;
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

.view-all-btn {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  font-family: inherit;
  font-size: inherit;
  font-weight: inherit;
  color: inherit;
}

.recent-orders-card {
  gap: 12px;
}

.schedule-modal-card {
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.schedule-modal-card .modal-category {
  background: var(--c-primary);
}

.schedule-modal-list {
  overflow-y: auto;
  flex: 1;
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

.bg-theme-card {
  padding-bottom: 18px;
}

.bg-theme-card :deep(.theme-switcher--panel) {
  margin-top: 4px;
}

/* ── Sales 業績圖區 ─────────────────────── */
.sales-chart-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.sales-summary-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sales-summary-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.summary-metric {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 14px;
  border: 0.5px solid var(--c-border);
  border-radius: 8px;
  background: var(--c-stripe);
}

.summary-label {
  font-size: 12px;
  color: #64748B;
}

.summary-value {
  font-family: var(--font-mono);
  font-size: 18px;
  font-weight: 600;
  color: #0F172A;
}

.sales-breakdown {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 4px;
  border-top: 0.5px solid var(--c-divider);
}

.breakdown-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.breakdown-label {
  font-size: 12px;
  color: #64748B;
}

.breakdown-value {
  font-family: var(--font-mono);
  font-size: 14px;
  font-weight: 600;
  color: #334155;
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
  padding: 12px 14px;
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
  width: 36px;
  height: 36px;
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
  padding: 18px 20px;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 20px;
}

.pending-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
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
  margin-top: 2px;
}

.pending-right {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
}

.pending-sub {
  font-size: 14px;
  font-weight: 400;
  color: #4b5568;
}

.pending-btn {
  align-self: flex-start;
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

.schedule-sort-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.schedule-sort-bar--modal {
  margin-top: -2px;
}

.schedule-sort-label {
  font-size: 12px;
  font-weight: 500;
  color: #64748b;
}

.schedule-sort-switch {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px;
  border: 1px solid var(--c-border);
  border-radius: 999px;
  background: #f8fafc;
}

.schedule-sort-btn {
  border: none;
  background: transparent;
  color: #64748b;
  border-radius: 999px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.18s ease, color 0.18s ease, opacity 0.18s ease;
}

.schedule-sort-btn.active {
  background: var(--c-primary);
  color: #ffffff;
}

.schedule-sort-btn:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.schedule-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 8px 0;
}

.schedule-item--clickable {
  cursor: pointer;
  border-radius: 8px;
  padding-left: 6px;
  padding-right: 16px;
  margin-left: -6px;
  margin-right: -16px;
}

.schedule-item--clickable:hover {
  background: var(--c-hover);
}

.schedule-item--clickable:focus-visible,
.schedule-item--clickable.selected {
  background: var(--c-primary);
}

.schedule-item.selected :deep(.item-name) {
  color: #ffffff !important;
}

.schedule-item.selected :deep(.item-address) {
  color: rgba(255, 255, 255, 0.75) !important;
}

.schedule-item.selected :deep(.item-badge) {
  background: rgba(255, 255, 255, 0.2) !important;
  color: #ffffff !important;
}

.schedule-item.selected :deep(.item-distance),
.schedule-item.selected :deep(.item-distance-icon) {
  color: rgba(255, 255, 255, 0.75) !important;
}

.schedule-item--clickable:focus-visible .appt-arrow,
.schedule-item--clickable.selected .appt-arrow {
  color: rgba(255, 255, 255, 0.75);
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

.appt-gps {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 10px;
  font-weight: 600;
  color: var(--c-primary);
  letter-spacing: 0.04em;
}

.appt-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex: 1;
}

.appt-customer-row {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.appt-customer {
  font-size: 13px;
  font-weight: 500;
  color: #334155;
}

.appt-order-badge {
  display: inline-flex;
  align-items: center;
  height: 18px;
  padding: 0 7px;
  border-radius: 999px;
  background: #ecfdf5;
  color: #047857;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.02em;
  white-space: nowrap;
}

.appt-address {
  font-size: 12px;
  font-weight: 400;
  color: #8b95a8;
}

.appt-arrow {
  color: #c0c8d4;
  font-size: 18px;
  line-height: 1;
  flex-shrink: 0;
  margin-left: auto;
}

.schedule-item-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
  flex-shrink: 0;
  padding-top: 2px;
}

.schedule-action-btn {
  min-width: 76px;
  border: 1px solid rgba(51, 65, 85, 0.18);
  background: transparent;
  color: #334155;
  border-radius: 999px;
  padding: 7px 12px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.18s ease, border-color 0.18s ease, color 0.18s ease, box-shadow 0.18s ease;
}

.schedule-action-btn:hover,
.schedule-action-btn:focus-visible,
.schedule-action-btn:active {
  background: #ffffff;
  color: #334155;
  border-color: rgba(51, 65, 85, 0.22);
  box-shadow: 0 6px 16px rgba(15, 23, 42, 0.08);
}

.schedule-item.selected .schedule-action-btn {
  background: transparent;
  border-color: rgba(255, 255, 255, 0.48);
  color: #ffffff;
  box-shadow: none;
}

.schedule-item.selected .schedule-action-btn:hover,
.schedule-item.selected .schedule-action-btn:focus-visible,
.schedule-item.selected .schedule-action-btn:active {
  background: #ffffff;
  border-color: rgba(255, 255, 255, 0.82);
  color: #334155;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.14);
}

/* ── 公佈欄 ─────────────────────────────── */
.bulletin-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.bulletin-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-bottom: 10px;
  border-bottom: 0.5px solid var(--c-divider);
}

.bulletin-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.bulletin-date {
  font-size: 12px;
  font-weight: 400;
  color: #8b95a8;
}

.bulletin-title {
  font-size: 13px;
  font-weight: 400;
  color: #334155;
  line-height: 1.5;
}

/* ── 公告點擊 ─────────────────────────────── */
.notice-clickable {
  cursor: pointer;
}
.notice-clickable:hover .notice-title,
.notice-clickable:hover .bulletin-title {
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
  background: #fff;
  border: 0.5px solid var(--c-border);
  border-top: 2px solid var(--c-primary);
  border-radius: var(--r-lg);
  padding: 24px 24px 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  box-shadow: 0 6px 32px 0 rgba(30, 41, 59, 0.18), 0 1.5px 6px 0 rgba(30, 41, 59, 0.10);
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
  color: #fff;
  background: var(--c-primary);
  border: none;
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
  font-size: 15px;
  font-weight: 400;
  color: #1a2540;
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
  .sales-chart-grid,
  .customer-board-grid,
  .sales-top-grid,
  .sales-summary-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .pending-card {
    padding: 14px 16px;
    gap: 14px;
  }

  .pending-number {
    font-size: 36px;
  }

  .pending-approval-label {
    font-size: 9px;
  }

  .pending-sub {
    font-size: 13px;
  }

  .pending-btn {
    font-size: 12px;
    padding: 6px 12px;
  }

  .schedule-item {
    flex-wrap: wrap;
  }

  .schedule-item-actions {
    width: 100%;
    margin-left: 21px;
    padding-top: 0;
  }
}

@media (max-width: 480px) {
  .modal-overlay {
    padding: 16px;
  }
  .modal-card {
    max-width: 100%;
  }

  .schedule-sort-bar {
    align-items: flex-start;
    flex-direction: column;
  }

  .schedule-sort-switch,
  .schedule-item-actions {
    width: 100%;
  }

  .schedule-action-btn {
    flex: 1;
    min-width: 0;
  }
}
</style>
