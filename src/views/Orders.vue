<template>
  <div class="orders-page">

    <!-- 頁面標題 -->
    <div class="page-title-block">
      <span class="eyebrow">MSM-CORE / ORDER MANAGEMENT</span>
      <h2 class="page-title">訂單列表</h2>
    </div>

    <!-- 篩選列 -->
    <div class="filter-bar">
      <select v-if="isGroupAdmin" v-model="filterCompany" class="filter-select">
        <option value="">全部公司</option>
        <option v-for="co in companies" :key="co" :value="co">{{ co }}</option>
      </select>
      <select v-model="filterStatus" class="filter-select">
        <option value="">全部狀態</option>
        <option v-for="opt in availableStatusOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
      </select>
      <div class="date-range">
        <input v-model="dateFrom" type="date" class="date-input" :max="dateTo || undefined" />
        <span class="date-sep">~</span>
        <input v-model="dateTo" type="date" class="date-input" :min="dateFrom || undefined" />
      </div>
      <button v-if="isSales" type="button" class="add-order-btn" style="margin-left: auto;" @click="openModal">
        <plus-icon :size="15" :stroke-width="1.5" />
        新增訂單
      </button>
      <button
        v-if="isSales"
        type="button"
        class="batch-transfer-btn"
        :disabled="selectedTransferableCount === 0"
        @click="batchTransfer"
      >
        批次拋單（{{ selectedTransferableCount }}）
      </button>
    </div>

    <!-- 桌機表格 -->
    <div class="table-wrap">
      <table class="orders-table">
        <thead>
          <tr>
            <th v-if="isSales" class="col-select" @click.stop>
              <input
                type="checkbox"
                :checked="isCurrentPageAllSelected"
                :indeterminate.prop="isCurrentPagePartiallySelected"
                @change="toggleSelectCurrentPage($event.target.checked)"
              />
            </th>
            <th v-if="isGroupAdmin" class="col-company">銷售公司</th>
            <th>訂單編號</th>
            <th>訂單日期</th>
            <th v-if="showCustomer">客戶名稱</th>
            <th>訂單狀態</th>
            <th class="col-amount">訂單金額</th>
            <th v-if="isSales" class="col-action"></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="order in pagedOrders"
            :key="order.orderId"
            :class="['table-row', { 'is-pending': isPendingStatus(order.status), 'is-selected': selectedOrderIds.includes(order.orderId) }]"
            @click="goToOrder(order.orderId)"
          >
            <td v-if="isSales" class="col-select" @click.stop>
              <input
                type="checkbox"
                :checked="selectedOrderIds.includes(order.orderId)"
                :disabled="!canBatchTransfer(order)"
                @change="toggleOrderSelected(order.orderId, $event.target.checked)"
              />
            </td>
            <td v-if="isGroupAdmin" class="col-company">{{ order.companyName }}</td>
            <td class="col-order-id mono">{{ order.orderId }}</td>
            <td>{{ order.date }}</td>
            <td v-if="showCustomer">{{ customerMap[order.customerId] || order.customerId }}</td>
            <td><status-badge :status="order.status" :viewer-role="currentUser.role" /></td>
            <td class="col-amount">$ {{ order.amount.toLocaleString() }}</td>
            <td v-if="isSales" class="col-action" @click.stop>
              <button
                v-if="canBatchTransfer(order)"
                type="button"
                class="review-btn"
                @click="$router.push('/orders/' + order.orderId + '/review')"
              >前往審單</button>
            </td>
          </tr>
          <tr v-if="pagedOrders.length === 0">
            <td :colspan="colSpan" class="empty-cell">沒有符合的訂單</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 手機卡片列表 -->
    <ul class="mobile-list">
      <li
        v-for="order in pagedOrders"
        :key="order.orderId"
        :class="['mobile-card', { 'is-pending': isPendingStatus(order.status), 'is-selected': selectedOrderIds.includes(order.orderId) }]"
        @click="goToOrder(order.orderId)"
      >
        <div class="mobile-top">
          <label v-if="isSales" class="mobile-check" @click.stop>
            <input
              type="checkbox"
              :checked="selectedOrderIds.includes(order.orderId)"
              :disabled="!canBatchTransfer(order)"
              @change="toggleOrderSelected(order.orderId, $event.target.checked)"
            />
          </label>
          <status-badge :status="order.status" :viewer-role="currentUser.role" />
          <span class="mobile-order-id mono">{{ order.orderId }}</span>
        </div>
        <div class="mobile-kv">
          <div v-if="isGroupAdmin" class="kv-item">
            <span class="kv-label">銷售公司</span>
            <span class="kv-value">{{ order.companyName }}</span>
          </div>
          <div class="kv-item">
            <span class="kv-label">日期</span>
            <span class="kv-value">{{ order.date }}</span>
          </div>
          <div v-if="showCustomer" class="kv-item">
            <span class="kv-label">客戶</span>
            <span class="kv-value">{{ customerMap[order.customerId] || order.customerId }}</span>
          </div>
          <div class="kv-item">
            <span class="kv-label">金額</span>
            <span class="kv-value kv-amount">$ {{ order.amount.toLocaleString() }}</span>
          </div>
        </div>
        <div v-if="isSales && canBatchTransfer(order)" class="mobile-actions">
          <button
            type="button"
            class="review-btn-mobile"
            @click.stop="$router.push('/orders/' + order.orderId + '/review')"
          >前往審單</button>
        </div>
      </li>
      <li v-if="pagedOrders.length === 0" class="mobile-empty">沒有符合的訂單</li>
    </ul>

    <!-- 選擇客戶 Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-dialog">
        <h3 class="modal-title">選擇客戶</h3>
        <input
          v-model.trim="modalSearch"
          type="text"
          class="modal-search"
          placeholder="搜尋客戶名稱"
        />
        <ul class="customer-list">
          <li
            v-for="customer in filteredCustomers"
            :key="customer.id"
            :class="['customer-item', { selected: selectedCustomerId === customer.id }]"
            @click="selectedCustomerId = customer.id"
          >
            <span class="customer-name">{{ customer.name }}</span>
            <span class="customer-address">{{ customer.address }}</span>
          </li>
          <li v-if="filteredCustomers.length === 0" class="customer-empty">沒有符合的客戶</li>
        </ul>
        <div class="modal-actions">
          <button type="button" class="modal-cancel-btn" @click="closeModal">取消</button>
          <button
            type="button"
            class="modal-confirm-btn"
            :disabled="!selectedCustomerId"
            @click="confirmCustomer"
          >確認</button>
        </div>
      </div>
    </div>

    <!-- 分頁 -->
    <div v-if="totalPages > 1" class="pagination">
      <button
        type="button"
        class="page-btn"
        :disabled="currentPage === 1"
        @click="currentPage = 1"
      >«</button>
      <button
        type="button"
        class="page-btn"
        :disabled="currentPage === 1"
        @click="currentPage--"
      >‹</button>

      <button
        v-for="p in pageNumbers"
        :key="p"
        type="button"
        :class="['page-btn', { active: p === currentPage }]"
        @click="currentPage = p"
      >{{ p }}</button>

      <button
        type="button"
        class="page-btn"
        :disabled="currentPage === totalPages"
        @click="currentPage++"
      >›</button>
      <button
        type="button"
        class="page-btn"
        :disabled="currentPage === totalPages"
        @click="currentPage = totalPages"
      >»</button>

      <span class="page-info">{{ currentPage }} / {{ totalPages }} 頁，共 {{ filteredOrders.length }} 筆</span>
    </div>

  </div>
</template>

<script>
import { customers } from '../mock/customers'
import { getCurrentUser } from '../services/auth'
import { todayScheduleIds } from '../mock/schedule'
import { Plus as PlusIcon } from 'lucide-vue'

const customerMap = Object.fromEntries(customers.map(c => [c.id, c.name]))

const PAGE_SIZE = 10

export default {
  name: 'OrdersPage',
  components: { PlusIcon },
  data () {
    return {
      customerMap,
      filterStatus: '',
      filterCompany: '',
      dateFrom: '',
      dateTo: '',
      currentPage: 1,
      customers,
      showModal: false,
      modalSearch: '',
      selectedCustomerId: null,
      selectedOrderIds: []
    }
  },
  computed: {
    currentUser () {
      return getCurrentUser() || { role: '' }
    },
    showCustomer () {
      return ['sales', 'company_admin', 'group_admin'].includes(this.currentUser.role)
    },
    isGroupAdmin () {
      return this.currentUser.role === 'group_admin'
    },
    isSales () {
      return this.currentUser.role === 'sales'
    },
    availableStatusOptions () {
      if (this.currentUser.role === 'customer') {
        return [
          { value: 'pending', label: '待審核' },
          { value: 'transferred', label: '已拋轉' },
          { value: 'shipped', label: '已出貨' }
        ]
      }
      return [
        { value: 'pending', label: '待審核' },
        { value: 'transferred', label: '已拋轉' },
        { value: 'error', label: '拋轉失敗' },
        { value: 'shipped', label: '已出貨' }
      ]
    },
    colSpan () {
      let cols = 4
      if (this.isSales) cols++
      if (this.isGroupAdmin) cols++
      if (this.showCustomer) cols++
      if (this.isSales) cols++
      return cols
    },
    companies () {
      const all = this.$store.state.orders.map(o => o.companyName).filter(Boolean)
      return [...new Set(all)].sort()
    },
    filteredCustomers () {
      const kw = this.modalSearch.toLowerCase()
      const list = kw
        ? this.customers.filter(c => c.name.toLowerCase().includes(kw))
        : [...this.customers]
      const scheduleIndex = Object.fromEntries(todayScheduleIds.map((id, i) => [id, i]))
      return list.sort((a, b) => {
        const ai = scheduleIndex[a.id] !== undefined ? scheduleIndex[a.id] : Infinity
        const bi = scheduleIndex[b.id] !== undefined ? scheduleIndex[b.id] : Infinity
        if (ai !== bi) return ai - bi
        return a.name.localeCompare(b.name, 'zh-TW')
      })
    },
    filteredOrders () {
      return this.$store.state.orders.filter(order => {
        if (this.filterCompany && order.companyName !== this.filterCompany) return false
        const displayStatus = this.normalizeStatus(order.status)
        if (this.filterStatus && displayStatus !== this.filterStatus) return false
        if (this.dateFrom && order.date < this.dateFrom) return false
        if (this.dateTo && order.date > this.dateTo) return false
        return true
      })
    },
    totalPages () {
      return Math.max(1, Math.ceil(this.filteredOrders.length / PAGE_SIZE))
    },
    pagedOrders () {
      const start = (this.currentPage - 1) * PAGE_SIZE
      return this.filteredOrders.slice(start, start + PAGE_SIZE)
    },
    currentPageTransferableOrders () {
      return this.pagedOrders.filter(order => this.canBatchTransfer(order))
    },
    isCurrentPageAllSelected () {
      if (this.currentPageTransferableOrders.length === 0) return false
      return this.currentPageTransferableOrders.every(order => this.selectedOrderIds.includes(order.orderId))
    },
    isCurrentPagePartiallySelected () {
      if (this.currentPageTransferableOrders.length === 0) return false
      const selectedCount = this.currentPageTransferableOrders.filter(order => this.selectedOrderIds.includes(order.orderId)).length
      return selectedCount > 0 && selectedCount < this.currentPageTransferableOrders.length
    },
    selectedTransferableCount () {
      const idSet = new Set(this.selectedOrderIds)
      return this.$store.state.orders.filter(order => idSet.has(order.orderId) && this.canBatchTransfer(order)).length
    },
    pageNumbers () {
      const range = []
      const delta = 2
      const left = Math.max(1, this.currentPage - delta)
      const right = Math.min(this.totalPages, this.currentPage + delta)
      for (let i = left; i <= right; i++) {
        range.push(i)
      }
      return range
    }
  },
  created () {
    if (this.$route.query.filter) {
      this.filterStatus = this.$route.query.filter
    }
  },
  watch: {
    filterCompany () { this.currentPage = 1 },
    filterStatus () { this.currentPage = 1 },
    dateFrom () { this.currentPage = 1 },
    dateTo () { this.currentPage = 1 }
  },
  methods: {
    canBatchTransfer (order) {
      if (!order) return false
      const s = order.status
      return s === 'pending' || s === 'error'
    },
    normalizeStatus (status) {
      const shippedRaw = ['confirmed', 'processing', 'cancelled', 'shipped']
      if (shippedRaw.includes(status)) return 'shipped'
      if (this.currentUser.role === 'customer' && status === 'error') return 'pending'
      return status
    },
    isPendingStatus (status) {
      return this.normalizeStatus(status) === 'pending'
    },
    toggleOrderSelected (orderId, checked) {
      if (checked) {
        if (!this.selectedOrderIds.includes(orderId)) {
          this.selectedOrderIds.push(orderId)
        }
        return
      }
      this.selectedOrderIds = this.selectedOrderIds.filter(id => id !== orderId)
    },
    toggleSelectCurrentPage (checked) {
      const pageIds = this.currentPageTransferableOrders.map(order => order.orderId)
      if (checked) {
        const merged = new Set([...this.selectedOrderIds, ...pageIds])
        this.selectedOrderIds = Array.from(merged)
        return
      }
      this.selectedOrderIds = this.selectedOrderIds.filter(id => !pageIds.includes(id))
    },
    batchTransfer () {
      if (this.selectedTransferableCount === 0) return
      const targetIds = new Set(this.selectedOrderIds)
      let successCount = 0
      this.$store.state.orders.forEach(order => {
        if (!targetIds.has(order.orderId)) return
        if (!this.canBatchTransfer(order)) return
        this.$store.dispatch('updateOrderStatus', { orderId: order.orderId, status: 'transferred' })
        successCount++
      })
      this.selectedOrderIds = []
      this.$store.dispatch('showSnackbar', {
        message: `批次拋單完成，共 ${successCount} 筆已拋轉`,
        type: 'success'
      })
    },
    goToOrder (orderId) {
      this.$router.push(`/orders/${orderId}`)
    },
    openModal () {
      this.modalSearch = ''
      this.selectedCustomerId = null
      this.showModal = true
    },
    closeModal () {
      this.showModal = false
    },
    confirmCustomer () {
      if (!this.selectedCustomerId) return
      this.closeModal()
      this.$router.push({ path: '/orders/new/review', query: { customerId: this.selectedCustomerId } })
    }
  }
}
</script>

<style scoped>
.page-title-block {
  margin-bottom: 24px;
}

.page-title {
  font-family: var(--font-serif);
  font-size: 22px;
  font-weight: 500;
  color: var(--c-text-title);
  margin: 0;
  letter-spacing: 0.02em;
}

/* ── 篩選列 ────────────────── */
.orders-page {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* ── 篩選列 ─────────────────────────── */
.filter-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.add-order-btn {
  height: 40px;
  padding: 0 20px;
  background: var(--c-primary);
  color: #ffffff;
  border: none;
  border-radius: var(--r-md);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
}

.batch-transfer-btn {
  height: 40px;
  padding: 0 16px;
  background: #0f766e;
  color: #ffffff;
  border: none;
  border-radius: var(--r-md);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
}

.batch-transfer-btn:disabled {
  background: #94a3b8;
  cursor: not-allowed;
}

.filter-select {
  height: 36px;
  padding: 0 32px 0 10px;
  border: 0.5px solid var(--c-border);
  border-radius: 6px;
  background-color: #ffffff;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M2 4l4 4 4-4' stroke='%2394a3b8' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' fill='none'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 12px;
  appearance: none;
  -webkit-appearance: none;
  color: #334155;
  font-size: 14px;
  font-weight: 400;
  line-height: 36px;
  outline: none;
  cursor: pointer;
}

.date-range {
  display: flex;
  align-items: center;
  gap: 8px;
}

.date-input {
  height: 38px;
  padding: 0 10px;
  border: 0.5px solid var(--c-border);
  border-radius: 6px;
  background: #ffffff;
  color: #334155;
  font-size: 14px;
  font-weight: 400;
  outline: none;
}

.date-sep {
  font-size: 14px;
  font-weight: 400;
  color: #8b95a8;
}

/* ── 桌機表格 ────────────────────────── */
.table-wrap {
  border: 0.5px solid var(--c-border);
  border-radius: 8px;
  overflow: hidden;
  background: #ffffff;
}

.orders-table {
  width: 100%;
  border-collapse: collapse;
}

.orders-table thead tr {
  background: #F8FAFC;
}

.orders-table th {
  padding: 14px 16px;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.06em;
  color: var(--c-text-muted);
  text-align: left;
  border-bottom: var(--border);
  text-transform: uppercase;
}

.col-amount {
  text-align: right;
}

.orders-table th.col-amount,
.orders-table td.col-amount {
  text-align: right;
}

.col-select {
  width: 44px;
  text-align: center;
}

.col-company {
  color: var(--c-text-sub);
  font-size: 13px;
  white-space: nowrap;
}

.orders-table td {
  padding: 14px 16px;
  font-size: 14px;
  font-weight: 400;
  color: var(--c-text-body);
  border-bottom: 0.5px solid var(--c-divider);
}

.orders-table tbody tr:last-child td {
  border-bottom: none;
}

.orders-table tbody tr:nth-child(even) td {
  background: #F9FBFE;
}

.table-row {
  cursor: pointer;
  transition: background 0.1s;
}

.table-row:hover td {
  background: #EEF3FB !important;
}

.table-row.is-selected td {
  background: #ecfdf5 !important;
}

.col-order-id {
  color: var(--c-primary) !important;
  font-family: var(--font-mono) !important;
  font-weight: 500 !important;
  letter-spacing: 0.04em !important;
}

.col-action {
  text-align: right;
  white-space: nowrap;
  width: 1%;
}

/* ── pending 列藍色直條 ──────────────── */
tr.is-pending td:first-child {
  border-left: 4px solid var(--c-primary);
}

/* ── 審單按鈕 ────────────────────────── */
.review-btn {
  padding: 6px 12px;
  border: 0.5px solid var(--c-primary);
  border-radius: 6px;
  background: transparent;
  color: var(--c-primary);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
}

.empty-cell {
  text-align: center;
  color: #8b95a8;
  padding: 32px 0 !important;
  font-size: 14px;
}

/* ── 手機卡片（隱藏於桌機） ─────────── */
.mobile-list {
  display: none;
  list-style: none;
  padding: 0;
  margin: 0;
  flex-direction: column;
  gap: 10px;
}

.mobile-card {
  border: 0.5px solid var(--c-border);
  border-radius: 8px;
  background: #ffffff;
  padding: 14px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.mobile-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.mobile-check {
  display: inline-flex;
  align-items: center;
}

.mobile-order-id {
  font-size: 14px;
  font-weight: 500;
  color: var(--c-primary);
}

.mobile-kv {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.kv-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.kv-label {
  font-size: 11px;
  font-weight: 500;
  color: var(--c-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.kv-value {
  font-size: 14px;
  font-weight: 500;
  color: var(--c-primary);
}

.kv-amount {
  font-weight: 500;
}

.mobile-actions {
  display: flex;
  justify-content: flex-end;
}

.review-btn-mobile {
  min-height: 44px;
  padding: 0 16px;
  border: 0.5px solid var(--c-primary);
  border-radius: 6px;
  background: transparent;
  color: var(--c-primary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
}

.mobile-card.is-pending {
  border-left: 4px solid var(--c-primary);
}

.mobile-card.is-selected {
  border-color: #10b981;
}

.mobile-empty {
  text-align: center;
  color: #8b95a8;
  font-size: 14px;
  padding: 24px 0;
}

/* ── 分頁 ────────────────────────────── */
.pagination {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.page-btn {
  min-width: 34px;
  height: 34px;
  padding: 0 8px;
  border: 0.5px solid var(--c-border);
  border-radius: 6px;
  background: #ffffff;
  color: var(--c-primary);
  font-size: 13px;
  font-weight: 400;
  cursor: pointer;
}

.page-btn:disabled {
  color: #c0c8d4;
  cursor: default;
}

.page-btn.active {
  background: var(--c-primary);
  color: #ffffff;
  border-color: var(--c-primary);
  font-weight: 500;
}

.page-info {
  margin-left: 6px;
  font-size: 13px;
  font-weight: 400;
  color: #8b95a8;
}

/* ── Modal ───────────────────────────── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.modal-dialog {
  width: 100%;
  max-width: 480px;
  background: #ffffff;
  border: 0.5px solid var(--c-border);
  border-radius: 10px;
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: 80vh;
}

.modal-title {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: #334155;
}

.modal-search {
  height: 38px;
  padding: 0 12px;
  border: 0.5px solid var(--c-border);
  border-radius: 6px;
  background: #ffffff;
  color: #334155;
  font-size: 14px;
  font-weight: 400;
  outline: none;
}

.customer-list {
  list-style: none;
  padding: 0;
  margin: 0;
  overflow-y: auto;
  max-height: 280px;
  border: 0.5px solid var(--c-border);
  border-radius: 6px;
}

.customer-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 12px 14px;
  border-bottom: 0.5px solid var(--c-divider);
  cursor: pointer;
}

.customer-item:last-child {
  border-bottom: none;
}

.customer-item:hover {
  background: #f8fafc;
}

.customer-item.selected {
  background: #eef3fb;
}

.customer-name {
  font-size: 14px;
  font-weight: 500;
  color: #334155;
}

.customer-address {
  font-size: 12px;
  font-weight: 400;
  color: #8b95a8;
}

.customer-empty {
  padding: 20px;
  text-align: center;
  color: #8b95a8;
  font-size: 13px;
  font-weight: 400;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.modal-cancel-btn {
  height: 38px;
  padding: 0 16px;
  border: 0.5px solid var(--c-border);
  border-radius: 6px;
  background: transparent;
  color: #4b5568;
  font-size: 14px;
  font-weight: 400;
  cursor: pointer;
}

.modal-confirm-btn {
  height: 38px;
  padding: 0 16px;
  border: none;
  border-radius: 6px;
  background: var(--c-primary);
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.modal-confirm-btn:disabled {
  background: #9ca7ba;
  cursor: not-allowed;
}

/* ── RWD ─────────────────────────────── */
@media (max-width: 768px) {
  .table-wrap {
    display: none;
  }

  .mobile-list {
    display: flex;
  }

  .date-range {
    flex-wrap: wrap;
  }

  .filter-select,
  .date-input {
    min-height: 44px;
    height: 44px;
    line-height: 44px;
  }

  .add-order-btn {
    width: 100%;
    min-height: 44px;
    height: 44px;
  }

  .batch-transfer-btn {
    width: 100%;
    min-height: 44px;
    height: 44px;
  }
}
</style>
