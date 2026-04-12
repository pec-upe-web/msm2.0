<template>
  <div class="record-detail-page">

    <!-- 頂部操作列 -->
    <div class="top-bar">
      <button type="button" class="back-btn" @click="$router.push('/inventory-checks')">
        <chevron-left-icon :size="16" :stroke-width="1.5" />
        返回盤點列表
      </button>
    </div>

    <!-- 找不到記錄 -->
    <div v-if="!record" class="not-found">
      <p>找不到盤點記錄（ID：{{ recordId }}）</p>
    </div>

    <template v-else>
      <!-- 基本資訊卡片 -->
      <section class="info-card">
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">盤點客戶</span>
            <span class="info-value">{{ record.customerName }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">盤點日期</span>
            <span class="info-value">{{ record.checkDate }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">盤點人員</span>
            <span class="info-value">{{ record.checker }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">提交時間</span>
            <span class="info-value">{{ formatSubmittedAt(record.submittedAt) }}</span>
          </div>
        </div>
      </section>

      <!-- 產品盤點區塊 -->
      <div class="blocks-list">
        <div
          v-for="(block, bIdx) in record.checkBlocks"
          :key="block._id || bIdx"
          class="check-block"
        >
          <div class="block-header">
            <span class="block-product">{{ productName(block.productId) }}</span>
            <span class="block-package">{{ block.package }}</span>
          </div>

          <div class="location-grid">
            <div v-for="loc in locations" :key="loc.key" class="location-item">
              <span class="location-tag">{{ loc.label }}</span>
              <div class="qty-row">
                <div class="qty-field">
                  <span class="qty-label">主數量</span>
                  <span class="qty-value">{{ block.qty[loc.key].main }}</span>
                </div>
                <div class="qty-field">
                  <span class="qty-label">小數量</span>
                  <span class="qty-value">{{ block.qty[loc.key].sub }}</span>
                </div>
              </div>
            </div>
          </div>

          <div v-if="block.photos && block.photos.length > 0" class="block-photo-row">
            <span class="block-photo-label">PHOTO CONFIRM</span>
            <div class="block-photo-thumbs">
              <img
                v-for="(url, pi) in block.photos"
                :key="pi"
                :src="url"
                class="block-photo-thumb"
                alt="盤點確認照片"
                @click="previewUrl = url"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 拍照存證 -->
      <section v-if="record.proofPhotos && record.proofPhotos.length > 0" class="proof-section">
        <div class="proof-header">
          <span class="proof-eyebrow">PHOTO EVIDENCE</span>
          <span class="proof-title">拍照存證</span>
        </div>
        <div class="proof-grid">
          <img
            v-for="(url, pi) in record.proofPhotos"
            :key="pi"
            :src="url"
            class="proof-thumb"
            alt="存證照片"
            @click="previewUrl = url"
          />
        </div>
      </section>
    </template>

    <!-- 照片放大預覽 -->
    <div v-if="previewUrl" class="preview-overlay" @click="previewUrl = null">
      <img :src="previewUrl" class="preview-img" alt="照片預覽" />
      <span class="preview-close">點擊任意處關閉</span>
    </div>

  </div>
</template>

<script>
import { products } from '../mock/products'
import { ChevronLeft as ChevronLeftIcon } from 'lucide-vue'

const LOCATIONS = [
  { key: 'warehouse', label: '倉庫' },
  { key: 'shelf', label: '貨架' },
  { key: 'display', label: '陳列' },
  { key: 'fridge', label: '冰箱' },
  { key: 'other', label: '其他' }
]

export default {
  name: 'InventoryRecordDetailPage',
  components: { ChevronLeftIcon },
  props: ['recordId'],
  data () {
    return {
      locations: LOCATIONS,
      previewUrl: null
    }
  },
  computed: {
    record () {
      return this.$store.state.inventoryRecords.find(r => r.id === this.recordId) || null
    }
  },
  methods: {
    productName (productId) {
      const p = products.find(prod => prod.id === productId)
      return p ? p.name : productId
    },
    formatSubmittedAt (iso) {
      if (!iso) return '—'
      const d = new Date(iso)
      const mm = String(d.getMonth() + 1).padStart(2, '0')
      const dd = String(d.getDate()).padStart(2, '0')
      const hh = String(d.getHours()).padStart(2, '0')
      const min = String(d.getMinutes()).padStart(2, '0')
      return `${d.getFullYear()}-${mm}-${dd} ${hh}:${min}`
    }
  }
}
</script>

<style scoped>
.record-detail-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ── 頂部 ─────────────────────────── */
.top-bar {
  display: flex;
  align-items: center;
}

.back-btn {
  border: none;
  background: none;
  color: var(--c-primary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  gap: 4px;
}

.not-found {
  text-align: center;
  color: #8b95a8;
  font-size: 14px;
  padding: 40px 0;
}

/* ── 資訊卡片 ─────────────────────── */
.info-card {
  border: 0.5px solid #E2E8F0;
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
  gap: 6px;
}

.info-label {
  font-size: 12px;
  font-weight: 400;
  color: #8b95a8;
}

.info-value {
  font-size: 14px;
  font-weight: 500;
  color: #334155;
}

/* ── 盤點區塊列表 ─────────────────── */
.blocks-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.check-block {
  border: 0.5px solid #E2E8F0;
  border-radius: 8px;
  background: #ffffff;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.block-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.block-product {
  font-size: 14px;
  font-weight: 600;
  color: #334155;
}

.block-package {
  font-size: 12px;
  font-weight: 400;
  color: #64748b;
  background: #F1F5F9;
  border-radius: 4px;
  padding: 2px 8px;
}

/* ── 位置 Grid ────────────────────── */
.location-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 10px;
}

.location-item {
  background: #F8FAFC;
  border: 0.5px solid #E2E8F0;
  border-radius: 6px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.location-tag {
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.qty-row {
  display: flex;
  gap: 12px;
}

.qty-field {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.qty-label {
  font-size: 11px;
  color: #94a3b8;
}

.qty-value {
  font-size: 14px;
  font-weight: 600;
  color: #334155;
}

/* ── 照片確認 ─────────────────────── */
.block-photo-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.block-photo-label {
  font-size: 10px;
  font-weight: 700;
  color: #94a3b8;
  letter-spacing: 0.08em;
  padding-top: 4px;
}

.block-photo-thumb {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
  cursor: pointer;
}

/* ── 存證照片 ─────────────────────── */
.proof-section {
  border: 0.5px solid #E2E8F0;
  border-radius: 8px;
  background: #ffffff;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.proof-header {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.proof-eyebrow {
  font-size: 10px;
  font-weight: 700;
  color: #94a3b8;
  letter-spacing: 0.08em;
}

.proof-title {
  font-size: 14px;
  font-weight: 600;
  color: #334155;
}

.proof-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.proof-thumb {
  width: 70px;
  height: 70px;
  object-fit: cover;
  border-radius: 6px;
  cursor: pointer;
}

/* ── 照片預覽 ─────────────────────── */
.preview-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.78);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 999;
  cursor: pointer;
}

.preview-img {
  max-width: 90vw;
  max-height: 80vh;
  object-fit: contain;
  border-radius: 8px;
}

.preview-close {
  margin-top: 14px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}
</style>
