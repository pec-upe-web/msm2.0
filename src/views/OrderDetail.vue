<template>
  <div class="order-detail-page">

    <!-- 頂部操作列 -->
    <div class="top-actions">
      <button type="button" class="back-btn" @click="goBack">
        <chevron-left-icon :size="16" :stroke-width="1.5" />
        返回訂單列表
      </button>
      <router-link
        v-if="canReview && order && order.status === 'pending'"
        :to="`/orders/${orderId}/review`"
        class="review-btn"
      >前往審單</router-link>
      <button
        v-if="canReview && order && order.status === 'error'"
        type="button"
        class="retransfer-btn"
        :disabled="isRetransferring"
        @click="retransfer"
      >{{ isRetransferring ? '拋轉中…' : '重新拋轉' }}</button>
    </div>

    <!-- 頁面標題 -->
    <div class="page-title-block">
      <span class="eyebrow">MSM-CORE / ORDER DETAIL</span>
      <h2 class="page-title">訂單明細</h2>
    </div>

    <!-- 找不到訂單 -->
    <div v-if="!order" class="not-found">找不到訂單 {{ orderId }}</div>

    <template v-else>

      <!-- 頂部資訊 Grid -->
      <section class="info-card">
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">訂單編號</span>
            <span class="info-value order-id-text mono">{{ order.orderId }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">訂單狀態</span>
            <span class="info-value"><status-badge :status="order.status" /></span>
          </div>
          <div class="info-item">
            <span class="info-label">訂單日期</span>
            <span class="info-value">{{ order.date }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">預計到貨日</span>
            <span class="info-value">{{ detail.deliveryDate || '—' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">銷售公司</span>
            <span class="info-value">{{ detail.salesCompany || '—' }}</span>
          </div>
          <div v-if="showCustomer" class="info-item">
            <span class="info-label">客戶名稱</span>
            <span class="info-value">{{ customerName }}</span>
          </div>
        </div>
      </section>

      <!-- 客戶送單明細 -->
      <section class="detail-section">
        <h3 class="section-title">客戶送單明細</h3>
        <div v-if="detail.items && detail.items.length > 0" class="table-wrap">
          <table class="detail-table">
            <thead>
              <tr>
                <th>產品名稱</th>
                <th>包裝別</th>
                <th class="col-num">數量</th>
                <th class="col-num">單價</th>
                <th class="col-num">小計</th>
                <th>贈品</th>
                <th>來源</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, idx) in detail.items" :key="idx" class="detail-row">
                <td>{{ item.name }}</td>
                <td>{{ item.package }}</td>
                <td class="col-num">{{ item.qty }}</td>
                <td class="col-num mono">{{ item.isGift ? '—' : ('NT$ ' + item.unitPrice.toLocaleString()) }}</td>
                <td class="col-num mono">{{ item.isGift ? '—' : ('NT$ ' + (item.unitPrice * item.qty).toLocaleString()) }}</td>
                <td><span v-if="item.isGift" class="gift-tag">贈品</span></td>
                <td><span class="source-badge" :class="'source--' + item.source">{{ sourceLabel(item.source) }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- 手機卡片 -->
        <ul v-if="detail.items && detail.items.length > 0" class="mobile-items">
          <li v-for="(item, idx) in detail.items" :key="idx" class="mobile-item-card">
            <div class="mic-head">
              <span class="mic-name">{{ item.name }}</span>
              <span v-if="item.isGift" class="gift-tag">贈品</span>
            </div>
            <div class="mic-grid">
              <div class="mic-kv">
                <span class="mic-label">包装別</span>
                <span class="mic-value">{{ item.package }}</span>
              </div>
              <div class="mic-kv">
                <span class="mic-label">數量</span>
                <span class="mic-value">{{ item.qty }}</span>
              </div>
              <div class="mic-kv">
                <span class="mic-label">單價</span>
                <span class="mic-value">{{ item.isGift ? '—' : 'NT$ ' + item.unitPrice }}</span>
              </div>
              <div class="mic-kv">
                <span class="mic-label">小計</span>
                <span class="mic-value mic-total">{{ item.isGift ? '—' : 'NT$ ' + (item.unitPrice * item.qty) }}</span>
              </div>
            </div>
            <div class="mic-foot">
              <span class="source-badge" :class="'source--' + item.source">{{ sourceLabel(item.source) }}</span>
            </div>
          </li>
        </ul>
        <div v-else class="no-data">
          <package-icon :size="32" :stroke-width="1.5" class="no-data-icon" />
          <p class="no-data-text">無明細資料</p>
        </div>
      </section>

      <!-- 業務審核後明細 -->
      <section v-if="hasReviewedItems" class="detail-section">
        <h3 class="section-title">業務審核後明細</h3>
        <div class="table-wrap">
          <table class="detail-table">
            <thead>
              <tr>
                <th>產品名稱</th>
                <th>包裝別</th>
                <th class="col-num">數量</th>
                <th class="col-num">單價</th>
                <th class="col-num">小計</th>
                <th>贈品</th>
                <th>來源</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, idx) in detail.reviewedItems" :key="idx" class="detail-row">
                <td>{{ item.name }}</td>
                <td>{{ item.package }}</td>
                <td class="col-num">{{ item.qty }}</td>
                <td class="col-num mono">{{ item.isGift ? '—' : ('NT$ ' + item.unitPrice.toLocaleString()) }}</td>
                <td class="col-num mono">{{ item.isGift ? '—' : ('NT$ ' + (item.unitPrice * item.qty).toLocaleString()) }}</td>
                <td><span v-if="item.isGift" class="gift-tag">贈品</span></td>
                <td><span class="source-badge" :class="'source--' + item.source">{{ sourceLabel(item.source) }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- 手機卡片 -->
        <ul class="mobile-items">
          <li v-for="(item, idx) in detail.reviewedItems" :key="idx" class="mobile-item-card">
            <div class="mic-head">
              <span class="mic-name">{{ item.name }}</span>
              <span v-if="item.isGift" class="gift-tag">贈品</span>
            </div>
            <div class="mic-grid">
              <div class="mic-kv">
                <span class="mic-label">包裝別</span>
                <span class="mic-value">{{ item.package }}</span>
              </div>
              <div class="mic-kv">
                <span class="mic-label">數量</span>
                <span class="mic-value">{{ item.qty }}</span>
              </div>
              <div class="mic-kv">
                <span class="mic-label">單價</span>
                <span class="mic-value">{{ item.isGift ? '—' : 'NT$ ' + item.unitPrice }}</span>
              </div>
              <div class="mic-kv">
                <span class="mic-label">小計</span>
                <span class="mic-value mic-total">{{ item.isGift ? '—' : 'NT$ ' + (item.unitPrice * item.qty) }}</span>
              </div>
            </div>
            <div class="mic-foot">
              <span class="source-badge" :class="'source--' + item.source">{{ sourceLabel(item.source) }}</span>
            </div>
          </li>
        </ul>
      </section>

      <!-- 二階系統資訊 -->
      <section v-if="(order.status === 'transferred' || order.status === 'error') && detail.transferredOrderId" class="transfer-card">
        <h3 class="section-title">二階系統資訊</h3>
        <div class="transfer-grid">
          <div class="info-item">
            <span class="info-label">二階訂單編號</span>
            <span class="info-value transfer-id">{{ detail.transferredOrderId }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">拋轉時間</span>
            <span class="info-value">{{ detail.transferredTime }}</span>
          </div>
        </div>
      </section>

    </template>
  </div>
</template>

<script>
import { orderDetails } from '../mock/orderDetails'
import { customers } from '../mock/customers'
import { getCurrentUser } from '../services/auth'
import {
  ChevronLeft as ChevronLeftIcon,
  Package as PackageIcon
} from 'lucide-vue'

const REVIEWED_STATUSES = ['confirmed', 'processing', 'transferred', 'cancelled', 'error']

export default {
  name: 'OrderDetailPage',
  components: { ChevronLeftIcon, PackageIcon },
  props: ['orderId'],
  data () {
    return {
      isRetransferring: false
    }
  },
  computed: {
    currentUser () {
      return getCurrentUser() || { role: '' }
    },
    showCustomer () {
      return ['sales', 'company_admin', 'group_admin'].includes(this.currentUser.role)
    },
    order () {
      return this.$store.state.orders.find(o => o.orderId === this.orderId) || null
    },
    customerName () {
      if (!this.order) return '—'
      const c = customers.find(c => c.id === this.order.customerId)
      return c ? c.name : (this.order.customerId || '—')
    },
    detail () {
      return orderDetails[this.orderId] || {}
    },
    hasReviewedItems () {
      return (
        this.order &&
        REVIEWED_STATUSES.includes(this.order.status) &&
        Array.isArray(this.detail.reviewedItems) &&
        this.detail.reviewedItems.length > 0
      )
    },
    canReview () {
      return (
        this.order &&
        this.currentUser.role === 'sales' &&
        (this.order.status === 'pending' || this.order.status === 'error')
      )
    },
    reviewBtnLabel () {
      return this.order && this.order.status === 'error' ? '重新拋轉' : '前往審單'
    }
  },
  methods: {
    retransfer () {
      this.isRetransferring = true
      setTimeout(() => {
        this.$store.dispatch('updateOrderStatus', { orderId: this.orderId, status: 'transferred' })
        this.$store.dispatch('showSnackbar', {
          message: '訂單重新拋轉成功，已進入二階系統',
          duration: 2500
        })
        this.isRetransferring = false
      }, 1500)
    },
    goBack () {
      const query = this.$route.query.filter
        ? { filter: this.$route.query.filter }
        : {}
      this.$router.push({ path: '/orders', query })
    },
    sourceLabel (source) {
      const map = {
        customer: '客戶送單',
        sales_add: '業務新增',
        sales_edit: '業務修改',
        system_gift: '系統贈品'
      }
      return map[source] || source
    }
  }
}
</script>

<style scoped>
.order-detail-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ── 頂部操作列 ───────────────────── */
.top-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.back-btn {
  border: none;
  background: none;
  color: var(--c-primary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
}

.review-btn {
  padding: 9px 18px;
  background: var(--c-primary);
  color: #ffffff;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
}

.retransfer-btn {
  padding: 9px 18px;
  background: #fff1f0;
  color: #cf1322;
  border: 0.5px solid #ffa39e;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s;
}
.retransfer-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.not-found {
  padding: 40px 0;
  text-align: center;
  color: #8b95a8;
  font-size: 15px;
  font-weight: 400;
}

/* ── 頂部資訊卡片 ─────────────────── */
.info-card {
  border: 0.5px solid var(--c-border);
  border-radius: 8px;
  background: #ffffff;
  padding: 18px;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.info-label {
  font-size: 11px;
  font-weight: 500;
  color: var(--c-text-muted);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.info-value {
  font-size: 14px;
  font-weight: 500;
  color: var(--c-text-title);
}

.order-id-text {
  font-family: var(--font-mono);
  color: var(--c-primary);
  letter-spacing: 0.04em;
}

/* ── 明細區塊 ────────────────────── */
.detail-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.section-title {
  margin: 0;
  font-family: var(--font-serif);
  font-size: 16px;
  font-weight: 500;
  color: var(--c-text-title);
  letter-spacing: 0.02em;
}

.table-wrap {
  border: var(--border);
  border-radius: 8px;
  overflow-x: auto;
  background: #ffffff;
}

.detail-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 600px;
}

.detail-table thead tr {
  background: #F8FAFC;
}

.detail-table th {
  padding: 12px 16px;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.06em;
  color: var(--c-text-muted);
  text-align: left;
  border-bottom: var(--border);
  white-space: nowrap;
  text-transform: uppercase;
}

.detail-table td {
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 400;
  color: var(--c-text-body);
  border-bottom: 0.5px solid var(--c-divider);
}

.detail-table tbody tr:last-child td {
  border-bottom: none;
}

.detail-table tbody tr:nth-child(even) td {
  background: #F9FBFE;
}

.col-num {
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.detail-row:hover td {
  background: #EEF3FB !important;
}

/* ── 贈品 tag ─────────────────────── */
.gift-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 20px;
  background: #f2eefb;
  color: #4a2a8c;
  font-size: 11px;
  font-weight: 500;
}

/* ── 來源 badge（莫蘭迪色系）───────── */
.source-badge {
  display: inline-flex;
  align-items: center;
  height: 20px;
  padding: 0 7px;
  border-radius: 2px;
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
  letter-spacing: 0.03em;
}

/* 客戶送單 — 極淡藍 */
.source--customer {
  background: #E0E7FF;
  color: var(--c-primary);
}

/* 業務新增 — 消色調綠 */
.source--sales_add {
  background: #E2EAE6;
  color: #2D5A3D;
}

/* 業務修改 — 淡米黃 */
.source--sales_edit {
  background: #FEF3C7;
  color: #92400E;
}

/* 系統贈品 — 淡紫 */
.source--system_gift {
  background: #EDE9FE;
  color: #4C1D95;
}

/* ── 無資料狀態 ────────────────── */
.no-data {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 36px 0;
  border: 0.5px solid var(--c-border);
  border-radius: 8px;
  background: #ffffff;
}

.no-data-icon {
  color: var(--c-border);
}

.no-data-text {
  margin: 0;
  font-size: 13px;
  font-weight: 400;
  color: #94A3B8;
}

/* ── 拋轉資訊 ─────────────────────── */
.transfer-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.transfer-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  padding: 18px;
  border: 0.5px solid var(--c-border);
  border-radius: 8px;
  background: #ffffff;
}

.transfer-id {
  color: var(--c-primary);
}

/* ── RWD ──────────────────────────── */
/* ── 手機明細卡片（桐機隱藏） ──────── */
.mobile-items {
  display: none;
  list-style: none;
  padding: 0;
  margin: 0;
  flex-direction: column;
  gap: 10px;
}

.mobile-item-card {
  border: 0.5px solid var(--c-border);
  border-radius: 8px;
  background: #FFFFFF;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 0;
}

.mic-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.mic-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--c-text-title);
  flex: 1;
  min-width: 0;
}

.mic-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.mic-kv {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.mic-label {
  font-size: 11px;
  font-weight: 500;
  color: var(--c-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.mic-value {
  font-size: 14px;
  font-weight: 500;
  color: var(--c-primary);
}

.mic-total {
  font-weight: 500;
}

.mic-foot {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .info-grid,
  .transfer-grid {
    grid-template-columns: 1fr;
  }

  .table-wrap {
    display: none;
  }

  .mobile-items {
    display: flex;
  }

  .back-btn,
  .review-btn {
    min-height: 44px;
  }
}
</style>
