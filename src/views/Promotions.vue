<template>
  <div class="promotions-page">

    <!-- ═══ 左側：活動列表 ═══════════════════════════ -->
    <aside class="promo-list" :class="{ 'is-hidden-mobile': mobileShowDetail }">

      <!-- 左側標題 -->
      <div class="promo-list-header">
        <span class="list-eyebrow">MARKET ACTIVITY</span>
        <h2 class="list-title">市場活動</h2>
      </div>

      <!-- 狀態篩選 Tab -->
      <div class="filter-tabs">
        <button
          v-for="tab in TABS"
          :key="tab.value"
          :class="['tab-btn', { 'tab-active': activeTab === tab.value }]"
          @click="activeTab = tab.value"
        >{{ tab.label }}</button>
      </div>

      <!-- 活動項目列表 -->
      <div class="list-body">
        <div
          v-for="promo in filteredPromos"
          :key="promo.id"
          :class="['promo-item', { 'promo-item--selected': selectedId === promo.id }]"
          @click="selectPromo(promo)"
        >
          <div class="promo-item-top">
            <span class="promo-name">{{ promo.name }}</span>
            <span :class="['status-badge', statusClass(promo.status)]">{{ statusLabel(promo.status) }}</span>
          </div>
          <div class="promo-period">{{ promo.startDate }} ～ {{ promo.endDate }}</div>
          <div class="promo-store-count">
            {{ promoProgressMap[promo.id].done }} / {{ promoProgressMap[promo.id].total }} 筆待辦
            <span class="progress-pct">{{ promoProgressMap[promo.id].percent }}%</span>
          </div>
          <div class="promo-progress-track">
            <div
              class="promo-progress-fill"
              :class="{ 'promo-progress-fill--done': promoProgressMap[promo.id].percent >= 100 }"
              :style="{ width: promoProgressMap[promo.id].percent + '%' }"
            ></div>
          </div>
        </div>
        <div v-if="filteredPromos.length === 0" class="list-empty">無符合條件的活動</div>
      </div>
    </aside>

    <!-- ═══ 右側：活動詳情 ═══════════════════════════════════════ -->
    <section class="promo-detail" :class="{ 'is-visible-mobile': mobileShowDetail }">

      <!-- 手機版返回按鈕 -->
      <button v-if="mobileShowDetail" class="mobile-back-btn" @click="mobileShowDetail = false">
        ← 返回活動列表
      </button>

      <template v-if="selectedPromo">

        <!-- 詳情標頭 -->
        <div class="detail-scroll">
          <div class="detail-header-row">
            <div class="detail-header-left">
              <h2 class="detail-title">{{ selectedPromo.name }}</h2>
              <div class="detail-period">{{ selectedPromo.startDate }} ～ {{ selectedPromo.endDate }}</div>
            </div>
            <span :class="['status-badge', statusClass(selectedPromo.status)]">{{ statusLabel(selectedPromo.status) }}</span>
          </div>
          <p class="detail-desc">{{ selectedPromo.description }}</p>

          <div class="section-divider"></div>

          <!-- 店家標頭 + 搜尋 -->
          <div class="stores-header">
            <span class="section-label">適用店家</span>
            <input
              v-model="storeSearch"
              type="text"
              class="store-search"
              placeholder="搜尋店家名稱…"
            />
          </div>

          <!-- 店家列表 -->
          <div class="store-list">
            <div v-for="store in filteredStores" :key="store.customerId" class="store-card">

              <!-- 店家列標頭（可點擊展開） -->
              <div class="store-row" @click="toggleStore(store.customerId)">
                <div class="store-left">
                  <span class="store-name">{{ store.name }}</span>
                  <span class="store-address">{{ store.address }}</span>
                </div>
                <div class="store-right">
                  <div class="store-progress-wrap">
                    <span class="store-progress">{{ doneTodosCount(store) }} / {{ store.todos.length }} 筆待辦</span>
                    <div class="store-progress-track">
                      <div
                        class="store-progress-fill"
                        :class="{ 'store-progress-fill--done': selectedStoreProgressMap[store.customerId] >= 100 }"
                        :style="{ width: selectedStoreProgressMap[store.customerId] + '%' }"
                      ></div>
                    </div>
                  </div>
                  <span class="chevron-icon">{{ expandedStores.includes(store.customerId) ? '▲' : '▼' }}</span>
                </div>
              </div>

              <!-- 待辦事項列表 -->
              <div v-if="expandedStores.includes(store.customerId)" class="todo-list">
                <div
                  v-for="(todo, tIdx) in store.todos"
                  :key="todo.id"
                  class="todo-item"
                >
                  <input
                    :id="'chk-' + todo.id"
                    v-model="todo.completed"
                    type="checkbox"
                    class="todo-check"
                  />
                  <div class="todo-body">
                    <label
                      :for="'chk-' + todo.id"
                      :class="['todo-text', { 'todo-done': todo.completed }]"
                    >{{ todo.text }}</label>

                    <!-- 照片區域 -->
                    <div v-if="todo.requiresPhoto" class="photo-area">
                      <div v-if="todo.photos && todo.photos.length" class="photo-thumbs">
                        <img
                          v-for="(url, pi) in todo.photos"
                          :key="pi"
                          :src="url"
                          class="photo-thumb"
                          alt="回傳照片"
                          @click="previewUrl = url"
                        />
                      </div>
                      <label class="upload-label">
                        <camera-icon :size="13" :stroke-width="1.5" />
                        {{ todo.photos && todo.photos.length ? '繼續上傳' : '上傳回傳照片' }}
                        <input
                          type="file"
                          accept="image/*"
                          class="file-input"
                          @change="e => onPhotoUpload(e, store, tIdx)"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

            </div>
            <div v-if="filteredStores.length === 0" class="store-empty">無符合搜尋條件的店家</div>
          </div>
        </div>
      </template>

      <!-- 未選取時的提示 -->
      <div v-else class="no-selection">
        <image-icon :size="32" :stroke-width="1.5" class="no-sel-icon" />
        <p class="no-sel-text">請從左側選擇一個活動</p>
      </div>

    </section>

    <!-- 照片放大預覽 -->
    <div v-if="previewUrl" class="preview-overlay" @click="previewUrl = null">
      <img :src="previewUrl" class="preview-img" alt="照片預覽" />
      <span class="preview-close">點擊任意處關閉</span>
    </div>

  </div>
</template>

<script>
import { promotionActivities as rawData } from '../mock/promotionActivities'
import { Camera as CameraIcon, Image as ImageIcon } from 'lucide-vue'

const TABS = [
  { label: '全部', value: 'all' },
  { label: '進行中', value: 'active' },
  { label: '未開始', value: 'upcoming' },
  { label: '已結束', value: 'ended' }
]

const STATUS_LABELS = { active: '進行中', upcoming: '未開始', ended: '已結束' }
const STATUS_CLASSES = { active: 'badge-active', upcoming: 'badge-upcoming', ended: 'badge-ended' }

function deepClone (val) {
  return JSON.parse(JSON.stringify(val))
}

export default {
  name: 'PromotionsPage',
  components: { CameraIcon, ImageIcon },
  data () {
    return {
      TABS,
      activeTab: 'all',
      activities: deepClone(rawData),
      selectedId: null,
      expandedStores: [],
      storeSearch: '',
      mobileShowDetail: false,
      previewUrl: null
    }
  },
  computed: {
    filteredPromos () {
      if (this.activeTab === 'all') return this.activities
      return this.activities.filter(a => a.status === this.activeTab)
    },
    selectedPromo () {
      return this.activities.find(a => a.id === this.selectedId) || null
    },
    filteredStores () {
      if (!this.selectedPromo) return []
      const kw = this.storeSearch.trim().toLowerCase()
      if (!kw) return this.selectedPromo.stores
      return this.selectedPromo.stores.filter(s => s.name.toLowerCase().includes(kw))
    },
    // 每個活動的整體待辦進度（以所有店家的 todos 加總計算）
    promoProgressMap () {
      const map = {}
      this.activities.forEach(promo => {
        let total = 0
        let done = 0
        promo.stores.forEach(store => {
          total += store.todos.length
          done += store.todos.filter(t => t.completed).length
        })
        map[promo.id] = {
          done,
          total,
          percent: total === 0 ? 0 : Math.round((done / total) * 100)
        }
      })
      return map
    },
    // 當前選中活動內，每個店家的待辦進度
    selectedStoreProgressMap () {
      const map = {}
      if (!this.selectedPromo) return map
      this.selectedPromo.stores.forEach(store => {
        const total = store.todos.length
        const done = store.todos.filter(t => t.completed).length
        map[store.customerId] = total === 0 ? 0 : Math.round((done / total) * 100)
      })
      return map
    }
  },
  watch: {
    filteredPromos (list) {
      // 篩選結果變動時自動選第一個
      if (list.length > 0) {
        this.selectedId = list[0].id
      } else {
        this.selectedId = null
      }
    },
    // 切換 tab 也觸發
    activeTab () {
      if (this.filteredPromos.length > 0) {
        this.selectedId = this.filteredPromos[0].id
      } else {
        this.selectedId = null
      }
    }
  },
  mounted () {
    // 初次進入自動選第一個
    if (this.filteredPromos.length > 0) {
      this.selectedId = this.filteredPromos[0].id
    }
  },
  methods: {
    progressPercent (promo) {
      if (!promo.stores.length) return 0
      return Math.round((this.doneStoresCount(promo) / promo.stores.length) * 100)
    },
    statusLabel (status) {
      return STATUS_LABELS[status] || status
    },
    statusClass (status) {
      return STATUS_CLASSES[status] || ''
    },
    doneStoresCount (promo) {
      return promo.stores.filter(s => s.todos.every(t => t.completed)).length
    },
    doneTodosCount (store) {
      return store.todos.filter(t => t.completed).length
    },
    selectPromo (promo) {
      this.selectedId = promo.id
      this.expandedStores = []
      this.storeSearch = ''
      this.mobileShowDetail = true
    },
    toggleStore (customerId) {
      const idx = this.expandedStores.indexOf(customerId)
      if (idx === -1) {
        this.expandedStores.push(customerId)
      } else {
        this.expandedStores.splice(idx, 1)
      }
    },
    onPhotoUpload (e, store, tIdx) {
      const file = e.target.files[0]
      if (!file) return
      const url = URL.createObjectURL(file)
      if (!Array.isArray(store.todos[tIdx].photos)) {
        this.$set(store.todos[tIdx], 'photos', [])
      }
      store.todos[tIdx].photos.push(url)
      e.target.value = ''
    }
  }
}
</script>

<style scoped>
/* ─────────────────────────────────────────────
   Master-Detail 佈局
   margin: -32px 抵消 DefaultLayout padding
   height: calc(100vh - 60px) 擐滿剩餘区域
─────────────────────────────────────────── */
.promotions-page {
  display: flex;
  height: calc(100vh - 60px);
  margin: -32px;
  overflow: hidden;
  background: var(--c-bg);
}

/* ═══ 左側面板 ═══════════════════════════ */
.promo-list {
  width: 360px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  background: var(--c-surface);
  border-right: 0.5px solid var(--c-border);
  overflow: hidden;
}

/* 左側標題區 */
.promo-list-header {
  padding: 20px 24px 14px;
  border-bottom: 0.5px solid #E2E8F0;
  flex-shrink: 0;
}

.list-eyebrow {
  display: block;
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.12em;
  color: #94A3B8;
  margin-bottom: 4px;
}

.list-title {
  margin: 0;
  font-family: var(--font-serif);
  font-size: 18px;
  font-weight: 500;
  color: #0F172A;
  letter-spacing: 0.02em;
}

/* 篩選 Tab 列：首個 Tab 左側與標題左對齊（padding-left: 24px） */
.filter-tabs {
  display: flex;
  border-bottom: 0.5px solid var(--c-border);
  padding: 0 24px 0 16px;
  gap: 0;
  flex-shrink: 0;
  background: var(--c-surface);
}

.tab-btn {
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  padding: 10px 8px;
  font-size: 13px;
  font-weight: 400;
  color: #8b95a8;
  cursor: pointer;
  margin-bottom: -1px;
  white-space: nowrap;
  letter-spacing: 0.01em;
}

.tab-active {
  color: var(--c-primary);
  font-weight: 500;
  border-bottom-color: var(--c-primary);
}

/* 列表捲動區 */
.list-body {
  overflow-y: auto;
  flex: 1;
}

/* 活動項目（List Item 樣式）
   使用 inset box-shadow 取代 border-left：
   - 裝飾線不佔用 box model 空間，內文對齊不受影響
   - 背景橫跨全寬（無左右 margin 縮排）
   - 所有子文字 padding-left: 24px 嚴格對齊標題 */
.promo-item {
  position: relative;
  padding: 12px 16px 12px 24px;
  border-bottom: 0.5px solid #F1F5F9;
  box-shadow: inset 3px 0 0 0 transparent;
  cursor: pointer;
  background: #ffffff;
  transition: background 0.1s, box-shadow 0.1s;
}

.promo-item:hover {
  background: #F8FAFC;
}

.promo-item--selected {
  background: #EEF3FB;
  box-shadow: inset 3px 0 0 0 var(--c-primary);
}

.promo-item-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
}

.promo-name {
  font-size: 14px;
  font-weight: 500;
  color: #334155;
  line-height: 1.4;
  flex: 1;
  min-width: 0;
}

.promo-period {
  font-size: 12px;
  font-weight: 400;
  color: #8b95a8;
  margin-bottom: 4px;
}

.promo-store-count {
  font-size: 12px;
  font-weight: 400;
  color: #64748B;
  margin-bottom: 4px;
}

.list-empty {
  padding: 32px 24px;
  text-align: center;
  font-size: 13px;
  color: #8b95a8;
}

/* ═══ 狀態 Badge（莫蘭迪色系） ═════════════════════ */
.status-badge {
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 8px;
  border-radius: 2px;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.05em;
  flex-shrink: 0;
  white-space: nowrap;
}

/* 進行中 — 曧綠色 莫蘭迪 */
.badge-active {
  background: #E2EAE6;
  color: #2D5A3D;
}

/* 未開始 — 極淡藍 */
.badge-upcoming {
  background: #E0E7FF;
  color: var(--c-primary);
}

/* 已結束 — 消音灰 */
.badge-ended {
  background: #F1F5F9;
  color: #94A3B8;
  border: 0.5px solid var(--c-border);
}

/* ═══ 右側面板 ═══════════════════════════ */
.promo-detail {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--c-bg);
}

/* 手機返回按鈕（桌機隱藏） */
.mobile-back-btn {
  display: none;
}

/* 捲動容器 */
.detail-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  background: var(--c-bg);
}

/* 詳情標頭 */
.detail-header-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.detail-header-left {
  flex: 1;
  min-width: 0;
}

.detail-title {
  font-family: var(--font-serif);
  font-size: 20px;
  font-weight: 500;
  color: #0F172A;
  margin: 0 0 4px;
  line-height: 1.3;
}

.detail-period {
  font-size: 13px;
  font-weight: 400;
  color: #8b95a8;
}

.detail-desc {
  font-size: 13px;
  font-weight: 400;
  color: #4b5568;
  line-height: 1.7;
  margin: 0;
}

.section-divider {
  height: 0.5px;
  background: var(--c-divider);
  margin: 16px 0;
}

/* 店家標頭列 */
.stores-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.section-label {
  font-size: 13px;
  font-weight: 500;
  color: #334155;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.store-search {
  height: 32px;
  padding: 0 10px;
  border: 0.5px solid var(--c-border);
  border-radius: 6px;
  background: var(--c-surface);
  color: #334155;
  font-size: 13px;
  font-weight: 400;
  outline: none;
  width: 180px;
}

/* 店家列表 */
.store-list {
  display: flex;
  flex-direction: column;
  border: 0.5px solid var(--c-border);
  border-radius: 8px;
  overflow: hidden;
  background: var(--c-surface);
}

/* 店家卡片 */
.store-card {
  border-radius: 0;
  background: var(--c-surface);
  overflow: hidden;
  border-bottom: 0.5px solid var(--c-divider);
}

.store-card:last-child {
  border-bottom: none;
}

.store-card:nth-child(even) {
  background: var(--c-stripe);
}

.store-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  cursor: pointer;
  gap: 12px;
  background: transparent;
}

.store-row:hover {
  background: #EEF3FB;
}

.store-left {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.store-name {
  font-size: 14px;
  font-weight: 500;
  color: #334155;
}

.store-address {
  font-size: 12px;
  font-weight: 400;
  color: #8b95a8;
}

.store-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.store-progress {
  font-size: 12px;
  font-weight: 400;
  color: #4b5568;
}

.chevron-icon {
  font-size: 10px;
  color: #8b95a8;
}

/* ═══ 待辦事項 ═══════════════════════════ */
.todo-list {
  border-top: 0.5px solid var(--c-border);
  background: var(--c-surface);
}

.todo-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 16px;
  border-bottom: 0.5px solid #F1F5F9;
}

.todo-item:last-child {
  border-bottom: none;
}

.todo-check {
  margin-top: 2px;
  accent-color: var(--c-primary);
  width: 15px;
  height: 15px;
  flex-shrink: 0;
  cursor: pointer;
}

.todo-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.todo-text {
  font-size: 13px;
  font-weight: 400;
  color: #334155;
  line-height: 1.5;
  cursor: pointer;
}

.todo-done {
  text-decoration: line-through;
  color: #8b95a8;
}

/* ═══ 上傳照片 ═══════════════════════════ */
.photo-area {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: flex-start;
}

.photo-thumbs {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.upload-label {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  border: 0.5px solid var(--c-primary);
  border-radius: 4px;
  color: var(--c-primary);
  font-size: 12px;
  font-weight: 400;
  cursor: pointer;
}

.file-input {
  display: none;
}

.photo-thumb {
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: 4px;
  border: 0.5px solid #E2E8F0;
  cursor: pointer;
  display: block;
}

/* 進度條（左側列表內） */
.promo-progress-track {
  height: 4px;
  background: #E2E8F0;
  border-radius: 2px;
  overflow: hidden;
  margin-top: 6px;
}

.promo-progress-fill {
  height: 100%;
  background: var(--c-primary);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.promo-progress-fill--done {
  background: #1A5C38;
}

.progress-pct {
  font-size: 11px;
  font-weight: 500;
  color: #64748B;
  margin-left: 4px;
}

/* 右側店家列迷你進度條 */
.store-progress-wrap {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.store-progress-track {
  width: 72px;
  height: 3px;
  background: #E2E8F0;
  border-radius: 2px;
  overflow: hidden;
}

.store-progress-fill {
  height: 100%;
  background: var(--c-primary);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.store-progress-fill--done {
  background: #1A5C38;
}

/* ═══ 未選取時佔位 ════════════════════════ */
.no-selection {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.no-sel-icon {
  color: var(--c-border);
}

.no-sel-text {
  margin: 0;
  font-size: 13px;
  font-weight: 400;
  color: #94A3B8;
  letter-spacing: 0.02em;
}

.store-empty {
  text-align: center;
  padding: 24px;
  font-size: 13px;
  font-weight: 400;
  color: #8b95a8;
}

/* ═══ 照片預覽 Overlay ════════════════════ */
.preview-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.72);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  cursor: pointer;
}

.preview-img {
  max-width: 90vw;
  max-height: 80vh;
  border-radius: 8px;
  object-fit: contain;
  display: block;
}

.preview-close {
  margin-top: 14px;
  font-size: 12px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.7);
}

/* ═══ RWD — 中小螢幕 820px ═══════════════ */
@media (max-width: 820px) {
  .promotions-page {
    margin: -20px -16px;
    height: calc(100vh - 60px);
  }
}

/* ═══ RWD — 手機版 768px ════════════════─ */
@media (max-width: 768px) {
  .promotions-page {
    height: auto;
    overflow: visible;
    flex-direction: column;
    margin: -16px;
  }

  .promo-list {
    width: 100%;
    border-right: none;
    border-bottom: 0.5px solid #E2E8F0;
    height: auto;
    overflow: visible;
  }

  .promo-list.is-hidden-mobile {
    display: none;
  }

  .promo-detail {
    display: none;
    overflow: visible;
    min-height: calc(100vh - 52px);
  }

  .promo-detail.is-visible-mobile {
    display: flex;
  }

  .mobile-back-btn {
    display: block;
    background: #ffffff;
    border: none;
    border-bottom: 0.5px solid #E2E8F0;
    color: var(--c-primary);
    font-size: 14px;
    font-weight: 500;
    padding: 12px 16px;
    text-align: left;
    width: 100%;
    cursor: pointer;
    flex-shrink: 0;
  }

  .detail-scroll {
    padding: 16px;
  }

  .stores-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .store-search {
    width: 100%;
  }

  .detail-title {
    font-size: 16px;
  }

  .filter-tabs {
    overflow-x: auto;
    padding: 0 4px;
    scrollbar-width: none;
  }

  .filter-tabs::-webkit-scrollbar {
    display: none;
  }
}

/* 篩選 Tabs */
.filter-tabs {
  display: flex;
  border-bottom: 0.5px solid #d0ddf0;
  padding: 0 8px;
  gap: 0;
  flex-shrink: 0;
  background: #ffffff;
}

.tab-btn {
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  padding: 12px 10px;
  font-size: 13px;
  font-weight: 400;
  color: #8b95a8;
  cursor: pointer;
  margin-bottom: -1px;
  white-space: nowrap;
}

.tab-active {
  color: var(--c-primary);
  font-weight: 500;
  border-bottom-color: var(--c-primary);
}

/* 列表捲動區 */
.list-body {
  overflow-y: auto;
  flex: 1;
}

/* 活動項目卡 */
.promo-item {
  position: relative;
  padding: 12px 16px 12px 24px;
  border-bottom: 0.5px solid #F1F5F9;
  box-shadow: inset 3px 0 0 0 transparent;
  cursor: pointer;
  background: #ffffff;
  transition: background 0.1s, box-shadow 0.1s;
}

.promo-item:hover {
  background: #F8FAFC;
}

.promo-item--selected {
  background: #EEF3FB;
  box-shadow: inset 3px 0 0 0 var(--c-primary);
}

.promo-item-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
}

.promo-name {
  font-size: 14px;
  font-weight: 500;
  color: #334155;
  line-height: 1.4;
}

.promo-period {
  font-size: 12px;
  font-weight: 400;
  color: #8b95a8;
  margin-bottom: 4px;
}

.promo-store-count {
  font-size: 12px;
  font-weight: 400;
  color: #4b5568;
}

.list-empty {
  padding: 32px 24px;
  text-align: center;
  font-size: 13px;
  color: #8b95a8;
}

/* ═══ 狀態 Badge ══════════════════════════════ */
.status-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 400;
  flex-shrink: 0;
  white-space: nowrap;
}

.badge-active {
  background: #edf7f1;
  color: #1a5c38;
}

.badge-upcoming {
  background: #eef3fb;
  color: var(--c-primary);
}

.badge-ended {
  background: #f5f5f5;
  color: #888888;
}

/* ═══ 右側面板 ════════════════════════════════ */
.promo-detail {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #f5f7fb;
}

/* 手機返回按鈕（桌機隱藏） */
.mobile-back-btn {
  display: none;
}

/* 捲動容器 */
.detail-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

/* 詳情標頭 */
.detail-header-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.detail-header-left {
  flex: 1;
  min-width: 0;
}

.detail-title {
  font-size: 18px;
  font-weight: 500;
  color: #334155;
  margin: 0 0 4px;
  line-height: 1.3;
}

.detail-period {
  font-size: 13px;
  font-weight: 400;
  color: #8b95a8;
}

.detail-desc {
  font-size: 13px;
  font-weight: 400;
  color: #4b5568;
  line-height: 1.7;
  margin: 0 0 0;
}

.section-divider {
  height: 0.5px;
  background: #d0ddf0;
  margin: 16px 0;
}

/* 店家標頭列 */
.stores-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.section-label {
  font-size: 14px;
  font-weight: 500;
  color: #334155;
}

.store-search {
  height: 32px;
  padding: 0 10px;
  border: 0.5px solid #E2E8F0;
  border-radius: 6px;
  background: #ffffff;
  color: #334155;
  font-size: 13px;
  font-weight: 400;
  outline: none;
  width: 180px;
}

/* 店家列表 */
.store-list {
  display: flex;
  flex-direction: column;
  border: 0.5px solid #E2E8F0;
  border-radius: 8px;
  overflow: hidden;
}

/* 店家卡片 */
.store-card {
  border-radius: 0;
  background: #ffffff;
  overflow: hidden;
  border-bottom: 0.5px solid #F1F5F9;
}

.store-card:last-child {
  border-bottom: none;
}

/* 旗魚紋 — 偶數行 */
.store-card:nth-child(even) {
  background: #F9FBFE;
}

.store-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  cursor: pointer;
  gap: 12px;
  background: transparent;
}

.store-row:hover {
  background: #EEF3FB;
}

.store-left {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.store-name {
  font-size: 14px;
  font-weight: 500;
  color: #334155;
}

.store-address {
  font-size: 12px;
  font-weight: 400;
  color: #8b95a8;
}

.store-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.store-progress {
  font-size: 12px;
  font-weight: 400;
  color: #4b5568;
}

.chevron-icon {
  font-size: 10px;
  color: #8b95a8;
}

/* ═══ 待辦事項 ════════════════════════════════ */
.todo-list {
  border-top: 0.5px solid #E2E8F0;
  background: #ffffff;
}

.todo-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 16px;
  border-bottom: 0.5px solid #F1F5F9;
}

.todo-item:last-child {
  border-bottom: none;
}

.todo-check {
  margin-top: 2px;
  accent-color: var(--c-primary);
  width: 15px;
  height: 15px;
  flex-shrink: 0;
  cursor: pointer;
}

.todo-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.todo-text {
  font-size: 13px;
  font-weight: 400;
  color: #334155;
  line-height: 1.5;
  cursor: pointer;
}

.todo-done {
  text-decoration: line-through;
  color: #8b95a8;
}

/* ═══ 上傳照片 ════════════════════════════════ */
.photo-area {
  display: flex;
  align-items: flex-start;
}

.upload-label {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  border: 0.5px solid var(--c-primary);
  border-radius: 4px;
  color: var(--c-primary);
  font-size: 12px;
  font-weight: 400;
  cursor: pointer;
}

.file-input {
  display: none;
}

.photo-thumb {
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: 4px;
  border: 0.5px solid #E2E8F0;
  cursor: pointer;
  display: block;
}

/* ═══ 未選取時提示 ═════════════════════════════ */
.no-selection {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 400;
  color: #8b95a8;
}

.store-empty {
  text-align: center;
  padding: 24px;
  font-size: 13px;
  font-weight: 400;
  color: #8b95a8;
}

/* ═══ 照片預覽 Overlay ════════════════════════ */
.preview-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.72);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  cursor: pointer;
}

.preview-img {
  max-width: 90vw;
  max-height: 80vh;
  border-radius: 8px;
  object-fit: contain;
  display: block;
}

.preview-close {
  margin-top: 14px;
  font-size: 12px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.7);
}

/* ═══ RWD — 手機版 ════════════════════════════ */
@media (max-width: 768px) {
  .promotions-page {
    height: auto;
    overflow: visible;
    flex-direction: column;
    margin: -24px;
  }

  .promo-list {
    width: 100%;
    border-right: none;
    border-bottom: 0.5px solid #d0ddf0;
    height: auto;
    overflow: visible;
  }

  .promo-list.is-hidden-mobile {
    display: none;
  }

  .promo-detail {
    display: none;
    overflow: visible;
  }

  .promo-detail.is-visible-mobile {
    display: flex;
  }

  .mobile-back-btn {
    display: block;
    background: #ffffff;
    border: none;
    border-bottom: 0.5px solid #d0ddf0;
    color: var(--c-primary);
    font-size: 14px;
    font-weight: 500;
    padding: 12px 16px;
    text-align: left;
    width: 100%;
    cursor: pointer;
    flex-shrink: 0;
  }

  .detail-scroll {
    padding: 16px;
  }

  .stores-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .store-search {
    width: 100%;
  }

  .detail-title {
    font-size: 16px;
  }

  .filter-tabs {
    overflow-x: auto;
    padding: 0 4px;
  }
}
</style>
