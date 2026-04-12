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
          @click="$router.push('/inventory-checks/' + customer.id)"
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
              {{ customer.distance }}km
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

  </div>
</template>

<script>
import { customers } from '../mock/customers'
import { getCurrentUser } from '../services/auth'
import {
  Search as SearchIcon,
  MapPin as MapPinIcon
} from 'lucide-vue'

// 台灣主要城市中心座標（用於模擬距離）
const CITY_COORDS = {
  C001: { lat: 25.040, lng: 121.565 },
  C002: { lat: 25.014, lng: 121.462 },
  C003: { lat: 24.954, lng: 121.224 },
  C004: { lat: 24.163, lng: 120.647 },
  C005: { lat: 22.612, lng: 120.301 }
}

function haversineKm (lat1, lng1, lat2, lng2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export default {
  name: 'InventoryChecksPage',
  components: { SearchIcon, MapPinIcon },
  data () {
    return {
      keyword: '',
      gpsLoading: false,
      gpsError: '',
      userLat: null,
      userLng: null,
      customerList: customers.map(c => ({ ...c, distance: null })),
      currentUser: getCurrentUser()
    }
  },
  computed: {
    myRecords () {
      if (!this.currentUser) return []
      return this.$store.state.inventoryRecords
        .filter(r => r.checkerId === this.currentUser.id)
        .sort((a, b) => (b.submittedAt || '').localeCompare(a.submittedAt || ''))
    },
    filteredCustomers () {
      if (!this.keyword) return this.customerList
      const kw = this.keyword.toLowerCase()
      return this.customerList.filter(
        c => c.name.toLowerCase().includes(kw) || c.address.toLowerCase().includes(kw)
      )
    },
    displayedCustomers () {
      if (this.userLat !== null) {
        return [...this.filteredCustomers].sort((a, b) => {
          const da = a.distance !== null ? a.distance : Infinity
          const db = b.distance !== null ? b.distance : Infinity
          return da - db
        })
      }
      return this.filteredCustomers
    }
  },
  methods: {
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
          this.userLat = pos.coords.latitude
          this.userLng = pos.coords.longitude
          this.customerList = this.customerList.map(c => {
            const coord = CITY_COORDS[c.id]
            if (!coord) return c
            const dist = haversineKm(this.userLat, this.userLng, coord.lat, coord.lng)
            return { ...c, distance: Math.round(dist * 10) / 10 }
          })
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
</style>
