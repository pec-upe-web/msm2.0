<template>
  <div class="inventory-checks-page">

    <!-- 頁面標題 -->
    <div class="page-title-block">
      <span class="eyebrow">MSM-CORE / INVENTORY</span>
      <h2 class="page-title">庫存盤點</h2>
    </div>

    <!-- 頂部搜尋 + GPS -->
    <div class="top-bar">
      <div class="search-wrapper">
        <search-icon :size="16" :stroke-width="1.5" class="search-icon-el" />
        <input
          v-model.trim="keyword"
          type="text"
          class="search-input"
          placeholder="搜尋店名或地址"
        />
      </div>
      <button type="button" class="gps-btn" :disabled="gpsLoading" @click="useGPS">
        <map-pin-icon :size="15" :stroke-width="1.5" />
        <span v-if="gpsLoading">定位中...</span>
        <span v-else>使用目前位置</span>
      </button>
    </div>

    <p v-if="gpsError" class="gps-error">{{ gpsError }}</p>

    <!-- 客戶列表 -->
    <section class="customer-section">
      <ul class="customer-list">
        <li
          v-for="customer in displayedCustomers"
          :key="customer.id"
          class="customer-item"
          @click="openInventoryDetail(customer.id)"
        >
          <div class="customer-main">
            <p class="customer-name">{{ customer.name }}</p>
            <p class="customer-addr">{{ customer.address }}</p>
            <p v-if="lastCheckDate(customer.id)" class="last-check">
              上次盤點：{{ lastCheckDate(customer.id) }}
            </p>
            <p v-else class="last-check no-check">尚未盤點</p>
          </div>
          <div class="customer-right">
            <span v-if="customer.distance !== null" class="distance-badge">
              {{ formatDistanceLabel(customer.distance) }}
            </span>
            <span class="arrow">›</span>
          </div>
        </li>
        <li v-if="displayedCustomers.length === 0" class="empty-item">沒有符合的客戶</li>
      </ul>
    </section>

    <!-- 最近盤點記錄 -->
    <section class="recent-section">
      <h3 class="section-title">我的盤點記錄</h3>
      <ul class="recent-list">
        <li
          v-for="(record, idx) in myRecords"
          :key="record.id || idx"
          class="recent-item"
          @click="$router.push('/inventory-checks/record/' + record.id)"
        >
          <div class="recent-left">
            <span class="recent-customer">{{ record.customerName }}</span>
            <span class="recent-checker">{{ record.checker }}</span>
          </div>
          <span class="recent-date">{{ record.checkDate }}</span>
        </li>
        <li v-if="myRecords.length === 0" class="recent-empty">尚無盤點記錄</li>
      </ul>
    </section>

    <!-- 選擇客戶 Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="customer-modal" role="dialog" aria-modal="true">
        <div class="customer-modal-header">
          <h3 class="customer-modal-title">選擇客戶</h3>
          <button type="button" class="modal-close-btn" @click="closeModal" aria-label="關閉">×</button>
        </div>

        <input
          v-model.trim="modalSearch"
          type="text"
          class="customer-modal-search"
          placeholder="搜尋客戶名稱"
        />

        <div class="customer-modal-tabs">
          <button
            type="button"
            :class="['customer-modal-tab', { active: selectionMode === 'my' }]"
            @click="switchSelectionMode('my')"
          >我的客戶</button>
          <button
            type="button"
            :class="['customer-modal-tab', { active: selectionMode === 'other' }]"
            @click="switchSelectionMode('other')"
          >不是我的客戶</button>
        </div>

        <div class="customer-modal-list">
          <button
            v-for="customer in modalCustomers"
            :key="customer.id"
            type="button"
            :class="['customer-modal-item', { selected: selectedCustomerId === customer.id }]"
            @click="selectCustomer(customer.id)"
          >
            <span class="customer-modal-name">{{ customer.name }}</span>
            <span class="customer-modal-address">{{ customer.address }}</span>
          </button>
          <div v-if="modalCustomers.length === 0" class="customer-modal-empty">沒有符合的客戶</div>
        </div>

        <div class="customer-modal-actions">
          <button type="button" class="customer-modal-cancel" @click="closeModal">取消</button>
          <button
            type="button"
            class="customer-modal-confirm"
            :disabled="!selectedCustomerId"
            @click="confirmCustomer"
          >確認</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import { getCurrentUser } from '../services/auth'
import { buildTodayStoreList } from '../mock/schedule'
import { customers } from '../mock/customers'
import { buildSelectableCustomers, getCustomerPoint } from '../utils/customerSelection'
import { formatDistanceLabel } from '../utils/distance'
import {
  Search as SearchIcon,
  MapPin as MapPinIcon
} from 'lucide-vue'

export default {
  name: 'InventoryChecksPage',
  components: { SearchIcon, MapPinIcon },
  data () {
    return {
      keyword: '',
      gpsLoading: false,
      gpsError: '',
      currentLocation: null,
      currentUser: getCurrentUser(),
      showModal: false,
      modalSearch: '',
      selectionMode: 'my',
      selectedCustomerId: null,
      selectionLocation: null
    }
  },
  computed: {
    myRecords () {
      if (!this.currentUser) return []
      return this.$store.state.inventoryRecords
        .filter(r => r.checkerId === this.currentUser.id)
        .sort((a, b) => (b.submittedAt || '').localeCompare(a.submittedAt || ''))
    },
    todayStoreList () {
      return buildTodayStoreList(this.currentLocation, { sortMode: 'distance' })
    },
    filteredCustomers () {
      if (!this.keyword) return this.todayStoreList
      const kw = this.keyword.toLowerCase()
      return this.todayStoreList.filter(
        c => c.name.toLowerCase().includes(kw) || c.address.toLowerCase().includes(kw)
      )
    },
    displayedCustomers () {
      return this.filteredCustomers
    },
    modalCustomers () {
      return buildSelectableCustomers({
        customers,
        currentUserId: this.currentUser ? this.currentUser.id : '',
        mode: this.selectionMode,
        currentLocation: this.selectionLocation || this.currentLocation,
        keyword: this.modalSearch
      })
    }
  },
  methods: {
    formatDistanceLabel,
    loadSelectionLocation () {
      if (!navigator.geolocation) return
      navigator.geolocation.getCurrentPosition(
        pos => {
          this.selectionLocation = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          }
        },
        () => {
          this.selectionLocation = null
        },
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
      )
    },
    openInventoryDetail (customerId) {
      this.$router.push({
        path: '/inventory-checks/' + customerId,
        query: {}
      })
    },
    lastCheckDate (customerId) {
      const record = this.myRecords.find(r => r.customerId === customerId)
      return record ? record.checkDate : null
    },
    useGPS () {
      if (!navigator.geolocation) {
        this.gpsError = '您的瀏覽器不支援定位功能'
        return
      }
      this.gpsLoading = true
      this.gpsError = ''
      navigator.geolocation.getCurrentPosition(
        pos => {
          this.currentLocation = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          }
          this.gpsLoading = false
        },
        err => {
          this.gpsLoading = false
          if (err.code === 1) {
            this.gpsError = '已拒絕定位權限，請在瀏覽器設定中允許'
          } else {
            this.gpsError = '無法取得定位，請稍後再試'
          }
        },
        { timeout: 10000 }
      )
    },
    openModal () {
      this.modalSearch = ''
      this.selectionMode = 'my'
      this.selectedCustomerId = null
      this.selectionLocation = null
      this.showModal = true
      this.loadSelectionLocation()
    },
    closeModal () {
      this.showModal = false
      this.modalSearch = ''
      this.selectionMode = 'my'
      this.selectedCustomerId = null
      this.selectionLocation = null
    },
    switchSelectionMode (mode) {
      this.selectionMode = mode
      this.selectedCustomerId = null
    },
    selectCustomer (customerId) {
      this.selectedCustomerId = customerId
    },
    confirmCustomer () {
      if (!this.selectedCustomerId) return
      const customer = customers.find(c => c.id === this.selectedCustomerId)
      const point = getCustomerPoint(customer)
      const query = { customerId: this.selectedCustomerId }
      if (point) {
        query.customerLat = String(point.lat)
        query.customerLng = String(point.lng)
      }
      this.closeModal()
      this.$router.push({ path: '/orders/new/review', query })
    }
  }
}
</script>

<style scoped>
.inventory-checks-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ── 頂部 ──────────────────────────── */
.top-bar {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.search-wrapper {
  flex: 1;
  min-width: 180px;
  position: relative;
}

.search-icon-el {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #94A3B8;
  pointer-events: none;
  flex-shrink: 0;
}

.search-input {
  width: 100%;
  height: 40px;
  padding: 0 12px 0 34px;
  border: 0.5px solid #E2E8F0;
  border-radius: 6px;
  background: #ffffff;
  color: #334155;
  font-size: 14px;
  font-weight: 400;
  outline: none;
}

.search-input::placeholder {
  color: #8b95a8;
}

.gps-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 40px;
  padding: 0 14px;
  border: 0.5px solid #E2E8F0;
  border-radius: 6px;
  background: #ffffff;
  color: var(--c-primary);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
}

.gps-btn:disabled {
  color: #8b95a8;
  cursor: default;
}

.gps-error {
  margin: 0;
  font-size: 13px;
  font-weight: 400;
  color: #8c2020;
}

/* ── 客戶列表 ───────────────────────── */
.customer-section {
  border: 0.5px solid #E2E8F0;
  border-radius: 8px;
  background: #ffffff;
  overflow: hidden;
}

.customer-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.customer-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  border-bottom: 0.5px solid #F1F5F9;
  cursor: pointer;
  transition: background 0.1s;
}

.customer-item:hover {
  background: #EEF3FB;
}

.customer-item:last-child {
  border-bottom: none;
}

/* 旗魚紋 */
.customer-item:nth-child(even) {
  background: #F9FBFE;
}

.customer-item:nth-child(even):hover {
  background: #EEF3FB;
}

.customer-main {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.customer-name {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: #334155;
}

.customer-addr {
  margin: 0;
  font-size: 12px;
  font-weight: 400;
  color: #8b95a8;
}

.last-check {
  margin: 0;
  font-size: 12px;
  font-weight: 400;
  color: #4b5568;
}

.no-check {
  color: #8c2020;
}

.customer-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.distance-badge {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
  color: var(--c-primary);
  background: #EEF3FB;
  border: 0.5px solid #C8D8EF;
  border-radius: 4px;
  padding: 2px 7px;
  white-space: nowrap;
  letter-spacing: 0.02em;
}

.arrow {
  font-size: 18px;
  color: #c0c8d4;
  line-height: 1;
}

.empty-item {
  padding: 28px;
  text-align: center;
  color: #8b95a8;
  font-size: 14px;
  font-weight: 400;
}

/* ── 最近盤點記錄 ─────────────────── */
.recent-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.section-title {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: #334155;
}

.recent-list {
  list-style: none;
  padding: 0;
  margin: 0;
  border: 0.5px solid #E2E8F0;
  border-radius: 8px;
  background: #ffffff;
  overflow: hidden;
}

.recent-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 0.5px solid #F1F5F9;
  cursor: pointer;
  transition: background 0.1s;
}

.recent-item:hover {
  background: #F8FAFC;
}

.recent-item:last-child {
  border-bottom: none;
}

.recent-left {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.recent-customer {
  font-size: 14px;
  font-weight: 500;
  color: #334155;
}

.recent-checker {
  font-size: 12px;
  font-weight: 400;
  color: #8b95a8;
}

.recent-date {
  font-size: 12px;
  font-weight: 400;
  color: #8b95a8;
  flex-shrink: 0;
}

.recent-empty {
  padding: 28px;
  text-align: center;
  color: #8b95a8;
  font-size: 14px;
  font-weight: 400;
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

.customer-modal {
  width: 100%;
  max-width: 520px;
  background: #ffffff;
  border: 0.5px solid #E2E8F0;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  max-height: min(80vh, 640px);
}

.customer-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.customer-modal-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
}

.modal-close-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 999px;
  background: #f8fafc;
  color: #64748b;
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
}

.customer-modal-search {
  height: 38px;
  padding: 0 12px;
  border: 0.5px solid #E2E8F0;
  border-radius: 8px;
  background: #ffffff;
  color: #334155;
  font-size: 14px;
  outline: none;
}

.customer-modal-tabs {
  display: flex;
  gap: 8px;
}

.customer-modal-tab {
  flex: 1;
  height: 36px;
  border: 0.5px solid #E2E8F0;
  border-radius: 999px;
  background: #ffffff;
  color: #475569;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
}

.customer-modal-tab.active {
  background: var(--c-primary);
  color: #ffffff;
  border-color: var(--c-primary);
}

.customer-modal-list {
  display: flex;
  flex-direction: column;
  gap: 0;
  overflow-y: auto;
  max-height: 320px;
  border: 0.5px solid #E2E8F0;
  border-radius: 10px;
  background: #ffffff;
}

.customer-modal-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
  width: 100%;
  padding: 12px 14px;
  border: none;
  border-bottom: 0.5px solid #E2E8F0;
  background: #ffffff;
  text-align: left;
  cursor: pointer;
}

.customer-modal-item:last-child {
  border-bottom: none;
}

.customer-modal-item:hover {
  background: #f8fafc;
}

.customer-modal-item.selected {
  background: #eef3fb;
}

.customer-modal-name {
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
}

.customer-modal-address {
  font-size: 12px;
  font-weight: 400;
  color: #94a3b8;
}

.customer-modal-empty {
  padding: 20px;
  text-align: center;
  color: #94a3b8;
  font-size: 13px;
}

.customer-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.customer-modal-cancel {
  height: 40px;
  padding: 0 16px;
  border: 0.5px solid #E2E8F0;
  border-radius: 8px;
  background: transparent;
  color: #475569;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.customer-modal-confirm {
  height: 40px;
  padding: 0 18px;
  border: none;
  border-radius: 8px;
  background: var(--c-primary);
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.customer-modal-confirm:disabled {
  background: #9ca7ba;
  cursor: not-allowed;
}
</style>
